from config import HF_API_KEY, HF_MODEL
import httpx
import json
import re
import ast
from typing import Any, List

API_URL = "https://router.huggingface.co/v1/chat/completions"


def _clean_json_text(text: str) -> str:
    # Remove markdown fences and normalize control chars that break strict JSON parsing.
    cleaned = text.strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    cleaned = cleaned.replace("\r", " ").replace("\n", " ").replace("\t", " ")
    return cleaned


def _escape_invalid_backslashes(text: str) -> str:
    # Convert illegal escapes (e.g. \_) into escaped backslashes so JSON parser can proceed.
    return re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)


def _normalize_question_text(text: str) -> str:
    cleaned = text.strip().strip(",").strip()
    cleaned = re.sub(r'^\s*(?:[-*]\s+|\d+[\)\.:\-]\s+)', "", cleaned)
    cleaned = re.sub(r'^\s*Q\d+[\)\.:\-]?\s*', "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip().strip('"').strip("'").strip()
    return re.sub(r"\s+", " ", cleaned)


def _coerce_question_list(items: list) -> List[str]:
    questions = [_normalize_question_text(str(item)) for item in items]
    questions = [q for q in questions if q]
    # Drop placeholder labels accidentally emitted by the model (e.g., "Q1").
    questions = [q for q in questions if not re.fullmatch(r"(?i)q\d+", q)]
    # Keep the first 10 in case the model returns extras.
    return questions[:10]


def _extract_questions_from_quoted_text(text: str) -> List[str]:
    source = _clean_json_text(text)
    array_match = re.search(r"\[(.*)\]", source)
    if array_match:
        source = array_match.group(1)

    quoted = re.findall(r'"((?:\\.|[^"\\])*)"', source)
    if not quoted:
        quoted = re.findall(r"'((?:\\.|[^'\\])*)'", source)

    questions = []
    for q in quoted:
        candidate = q.replace("\\n", " ").replace("\\t", " ").strip()
        if candidate:
            questions.append(candidate)
    return _coerce_question_list(questions)


def _extract_questions_from_lines(text: str) -> List[str]:
    lines = []
    for line in text.splitlines():
        normalized = _normalize_question_text(line)
        if normalized:
            lines.append(normalized)
    return _coerce_question_list(lines)


def _extract_json_candidate(text: str) -> str:
    source = _clean_json_text(text)
    bracket_match = re.search(r"(\{.*\}|\[.*\])", source, re.DOTALL)
    if bracket_match:
        return bracket_match.group(1)
    return source


def _extract_first_balanced_json(text: str) -> str:
    source = _clean_json_text(text)
    start_index = None
    opening = None

    for index, character in enumerate(source):
        if character in "[{":
            start_index = index
            opening = character
            break

    if start_index is None or opening is None:
        return source

    closing = "]" if opening == "[" else "}"
    depth = 0
    in_string = False
    escaped = False

    for index in range(start_index, len(source)):
        character = source[index]

        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue

        if character == '"':
            in_string = True
            continue

        if character == opening:
            depth += 1
        elif character == closing:
            depth -= 1
            if depth == 0:
                return source[start_index : index + 1]

    return source[start_index:]


def _extract_balanced_json_objects(text: str) -> List[str]:
    source = _clean_json_text(text)
    objects = []
    start_index = None
    depth = 0
    in_string = False
    escaped = False

    for index, character in enumerate(source):
        if in_string:
            if escaped:
                escaped = False
            elif character == "\\":
                escaped = True
            elif character == '"':
                in_string = False
            continue

        if character == '"':
            in_string = True
            continue

        if character == "{":
            if depth == 0:
                start_index = index
            depth += 1
            continue

        if character == "}" and depth > 0:
            depth -= 1
            if depth == 0 and start_index is not None:
                objects.append(source[start_index : index + 1])
                start_index = None

    return objects


def _parse_json_response(content: str) -> Any:
    parse_errors = []
    candidates = [
        content,
        _clean_json_text(content),
        _extract_json_candidate(content),
        _extract_first_balanced_json(content),
    ]

    for candidate in candidates:
        json_candidate = _escape_invalid_backslashes(candidate)
        try:
            return json.loads(json_candidate, strict=False)
        except Exception as exc:
            parse_errors.append(str(exc))

        try:
            return ast.literal_eval(json_candidate)
        except Exception as exc:
            parse_errors.append(str(exc))

    object_candidates = _extract_balanced_json_objects(content)
    if object_candidates:
        parsed_items = []
        for candidate in object_candidates:
            json_candidate = _escape_invalid_backslashes(candidate)
            try:
                parsed_value = json.loads(json_candidate, strict=False)
            except Exception:
                try:
                    parsed_value = ast.literal_eval(json_candidate)
                except Exception as exc:
                    parse_errors.append(str(exc))
                    continue

            if isinstance(parsed_value, dict):
                parsed_items.append(parsed_value)
            elif isinstance(parsed_value, list):
                parsed_items.extend([item for item in parsed_value if isinstance(item, dict)])

        if parsed_items:
            return parsed_items

    details = parse_errors[-1] if parse_errors else "Unknown parse failure"
    raise ValueError(f"HuggingFace API Error: Failed to parse JSON response: {details}")


def _parse_questions(content: str) -> List[str]:
    parse_errors = []
    candidates = [content, _clean_json_text(content)]

    bracket_match = re.search(r"\[.*\]", content, re.DOTALL)
    if bracket_match:
        candidates.append(bracket_match.group(0))

    for candidate in candidates:
        json_candidate = _escape_invalid_backslashes(candidate)
        try:
            parsed = json.loads(json_candidate, strict=False)
            if isinstance(parsed, list):
                questions = _coerce_question_list(parsed)
                if len(questions) == 10:
                    return questions
        except Exception as exc:
            parse_errors.append(str(exc))

        try:
            parsed = ast.literal_eval(json_candidate)
            if isinstance(parsed, list):
                questions = _coerce_question_list(parsed)
                if len(questions) == 10:
                    return questions
        except Exception as exc:
            parse_errors.append(str(exc))

    quoted_questions = _extract_questions_from_quoted_text(content)
    if len(quoted_questions) == 10:
        return quoted_questions

    line_questions = _extract_questions_from_lines(content)
    if len(line_questions) == 10:
        return line_questions

    details = parse_errors[-1] if parse_errors else "Unknown parse failure"
    raise ValueError(f"HuggingFace API Error: Failed to parse questions: {details}")

async def generate_question(interview_topic: str, interview_level: str) -> List[str]:
    prompt = f"""
    Generate exactly 10 {interview_level}-level interview questions on the topic: {interview_topic}.

    Return ONLY a valid JSON array:
    ["Question text 1", "Question text 2", ..., "Question text 10"]
    """

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": HF_MODEL,  # e.g. "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai"
        "messages": [
            {
                "role": "system",
                "content": "You are an AI that ONLY returns valid JSON arrays."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 300
    }
    if not HF_API_KEY:
        raise ValueError("HuggingFace API Error: Missing HF_API_KEY in environment")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(API_URL, headers=headers, json=payload)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise ValueError(f"HuggingFace API Error: {e.response.status_code} - {e.response.text}") from e

        result = response.json()

    choices = result.get("choices", [])
    if not choices:
        raise ValueError("HuggingFace API Error: Invalid response format (choices missing)")

    content = choices[0].get("message", {}).get("content", "")
    if not content:
        raise ValueError("HuggingFace API Error: Empty response content")

    # Primary parse attempt (strict)
    try:
        questions = _parse_questions(content)
    except ValueError:
        # Fallbacks: try extracting quoted questions or line-based questions
        quoted = _extract_questions_from_quoted_text(content)
        lines = _extract_questions_from_lines(content)
        # merge preserving order and uniqueness
        seen = set()
        merged = []
        for q in (quoted + lines):
            if q not in seen:
                seen.add(q)
                merged.append(q)
            if len(merged) >= 10:
                break

        if merged:
            # If we have at least one candidate, return up to 10
            if len(merged) != 10:
                # best-effort warning via exception detail for logs — still return reduced list
                # include small excerpt for debugging
                excerpt = content.strip()[:500]
                try:
                    # prefer raising an informative error to be handled by caller logs
                    raise ValueError(f"HuggingFace API Warning: parsed {len(merged)}/10 questions from model output. excerpt: {excerpt}")
                except ValueError:
                    # swallow here and return best-effort result to avoid blocking session creation
                    return merged[:10]
            return merged[:10]

        # nothing found — include content excerpt in the raised error for easier debugging
        excerpt = content.strip()[:1000]
        raise ValueError(f"HuggingFace API Error: Failed to parse questions: {excerpt}")

    if not isinstance(questions, list):
        raise ValueError("HuggingFace API Error: Output is not a JSON array")

    if len(questions) != 10:
        raise ValueError(f"HuggingFace API Error: Expected 10 questions, got {len(questions)}")

    return questions

# generate score and give ideal answer and feedback for a user answers to a questions
async def generate_score_and_feedback( questions_answers: list) -> list:
    # question_id = question_answer.get("question_id")
    # question = question_answer.get("question")
    # user_answer = question_answer.get("user_answer")
    input_payload = json.dumps(questions_answers, ensure_ascii=False)
    # print(f"Input payload for scoring: {input_payload}")
    # print(len(questions_answers))
    prompt = f"""
You are a strict technical interview evaluator.

Carefully evaluate each answer before scoring.

EVALUATION CRITERIA (in order):

1. Relevance → Does the answer directly address the question?
2. Correctness → Are the concepts accurate?
3. Completeness → Are key points covered?

CRITICAL RULES:

* If answer is NOT relevant to the question → score = 0
* If answer correctly explains a DIFFERENT question → score = 0
* Do NOT reward general correctness if it does not match the question intent
* Major incorrect concepts → score = 0–1
* Minor mistakes or incomplete answer → score = 2–4
* Missing key points → max score = 6
* Mostly correct with small gaps → score = 7–8
* Fully correct, relevant, and complete → score = 9–10
* Score 10 ONLY if answer is perfect

STRICT VALIDATION:

* Compare the user answer with the IDEAL ANSWER
* Identify:
  • Missing concepts
  • Incorrect concepts
  • Irrelevant content
  • Answer mismatch (wrong question answered)

SCORING SCALE:

* 0: Completely irrelevant or wrong question answered
* 1: Mostly incorrect
* 2–4: Partially correct with major gaps
* 5–6: Moderate understanding but incomplete
* 7–8: Mostly correct with minor gaps
* 9–10: Fully correct and precise

OUTPUT RULES:

* ONLY valid JSON
* No extra text or explanation
* Score must be an integer (0–10)
* Return EXACTLY {len(questions_answers)} objects
* DO NOT skip any question
* DO NOT stop early

FEEDBACK RULE:

* MUST NOT be empty
* Max 12 words
* One sentence only
* Clearly state mistake OR say "Correct and complete" if perfect

IDEAL ANSWER RULE:

* Max 30 words
* Include only key concepts
* Clear and concise

IMPORTANT:

* Think step-by-step internally before scoring
* Do NOT output reasoning

JSON FORMAT:
[
{{
"question_id": "string",
"score": <int>,
"ideal_answer": "<short answer>",
"feedback": "<short feedback>"
}}
]

INPUT:
{input_payload}


"""
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": HF_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an AI that ONLY returns valid JSON objects."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0,
        "top_p": 1,
        "max_tokens": 500
    }

    if not HF_API_KEY:
        raise ValueError("HuggingFace API Error: Missing HF_API_KEY in environment")

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(API_URL, headers=headers, json=payload)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise ValueError(f"HuggingFace API Error: {e.response.status_code} - {e.response.text}") from e
        result = response.json()
        # print(f"HuggingFace API response: {result}")
    choices = result.get("choices", [])
    if not choices:
        raise ValueError("HuggingFace API Error: Invalid response format (choices missing)")

    content = choices[0].get("message", {}).get("content", "")
    if not content:
        raise ValueError("HuggingFace API Error: Empty response content")

    parsed = _parse_json_response(content)

    if isinstance(parsed, dict):
        return [parsed]

    if isinstance(parsed, list):
        return parsed

    raise ValueError("HuggingFace API Error: Output is not valid JSON object or array")