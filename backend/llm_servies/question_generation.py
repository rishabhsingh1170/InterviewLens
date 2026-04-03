from config import HF_API_KEY, HF_MODEL
import httpx
import json
import re
import ast
from typing import List

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
    cleaned = cleaned.strip().strip('"').strip("'").strip()
    return re.sub(r"\s+", " ", cleaned)


def _coerce_question_list(items: list) -> List[str]:
    questions = [_normalize_question_text(str(item)) for item in items]
    questions = [q for q in questions if q]
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
    ["Q1", "Q2", ..., "Q10"]
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

    questions = _parse_questions(content)

    # ✅ Validation
    if not isinstance(questions, list):
        raise ValueError("HuggingFace API Error: Output is not a JSON array")

    if len(questions) != 10:
        raise ValueError(f"HuggingFace API Error: Expected 10 questions, got {len(questions)}")

    return questions