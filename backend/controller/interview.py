import json

from bson import ObjectId
from bson.errors import InvalidId

from models.sesion_schema import SessionCreate
from models.question_answer_schema import QuestionsAnswers
from database import session_collection, question_Answer_collection, user_collection
from fastapi import HTTPException
from llm_servies.question_generation import generate_question, generate_score_and_feedback


def _to_object_id(value: str, field_name: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}") from exc


async def _fetch_session_with_questions(session_id, user_id):
    session = await session_collection.find_one({
        "_id": _to_object_id(session_id, "session_id"),
        "user_id": user_id
    })

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    question_ids = session.get("questions", [])
    questions = []

    for question_id in question_ids:
        q = await question_Answer_collection.find_one({"_id": _to_object_id(question_id, "question_id")})
        if q:
            questions.append({
                "question_id": str(q["_id"]),
                "question": q.get("question", ""),
                "ideal_answer": q.get("ideal_answer", ""),
                "user_answer": q.get("user_answer", ""),
                "score": q.get("score", 0.0),
                "feedback": q.get("feedback", "")
            })

    return {
        "session_id": str(session["_id"]),
        "topic": session.get("topic", ""),
        "level": session.get("level", ""),
        "status": session.get("status", ""),
        "overall_score": session.get("overall_score", 0.0),
        "questions": questions
    }

#create interview session and questions for the session and add session id to user collection, questions id to session collection
async def create_interview(session, user_id):
    try:
        new_session = SessionCreate(
            user_id=user_id,
            topic=session.topic,
            level=session.level,
            status=session.status,
            overall_score=session.overall_score,
            scores_id=session.scores_id,
            questions=session.questions
        )

        try:
            questions = await generate_question(session.topic, session.level)
        except ValueError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        
        #insert question to question collection and get question ids
        try:
            question_ids = []
            for question in questions:
                question_data = QuestionsAnswers(
                    question=question,
                    ideal_answer="",
                    user_answer="",
                    score=0.0,
                    feedback=""
                )
                result = await question_Answer_collection.insert_one(question_data.model_dump(exclude={"id"}))
                question_ids.append(str(result.inserted_id))
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="Error occurred while inserting questions into the database")        

        # create session in session collection and put question ids in session document
        try:
            new_session.questions = question_ids
            result = await session_collection.insert_one(new_session.model_dump(exclude={"session_id"}))
            new_session.session_id = str(result.inserted_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error occurred while creating interview session in the database")
        
        #add session_id to user collection
        try:
            print(f"Adding session_id {new_session.session_id} to user {user_id}")
            await user_collection.update_one({"_id": ObjectId(user_id)}, {"$push": {"sessions": new_session.session_id}})
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error occurred while adding session to user")
        
        return new_session
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while creating interview session")

# get all intervie sessions for a user with session id and topic
async def get_sessions(user_id):
    print(f"Fetching interview sessions for user_id: {user_id}")

    try:
        sessions = await session_collection.find(
            {"user_id": user_id},
            {"_id": 1, "topic": 1, "level": 1, "status": 1, "overall_score": 1}
        ).to_list(length=None)

        if not sessions:
            raise HTTPException(status_code=404, detail="No sessions found for this user")

        return [
            {
                "session_id": str(s["_id"]),
                "topic": s.get("topic", ""),
                "level": s.get("level", ""),
                "status": s.get("status", ""),
                "overall_score": s.get("overall_score", 0.0)
            }
            for s in sessions
        ]

    except HTTPException:
        # let FastAPI handle it properly
        raise

    except Exception as e:
        # log actual error in console
        print("ERROR:", str(e))

        # return real error message
        raise HTTPException(
            status_code=500,
            detail=str(e) 
        )
    

# get all interview questions with questions id of a session and session id for a user    
async def start_interview(session_id, user_id):
    try:
        interview_data = await _fetch_session_with_questions(session_id, user_id)
        
        #check point to check that session is complete or not
        if interview_data.get("status") == "complete":
            raise HTTPException(status_code=400, detail="Interview session is already complete")
        return interview_data

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


async def get_session_details(session_id, user_id):
    try:
        return await _fetch_session_with_questions(session_id, user_id)
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# save user answer of a question    
async def save_answer( question_id, user_answer):
    try:
        result = await question_Answer_collection.update_one(
            {"_id": _to_object_id(question_id, "question_id")},
            {"$set": {"user_answer": user_answer}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")

        return {"message": "User answer saved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error occurred while saving user answer")
    
# save score and feedback for a user answer of a question
async def save_score_and_feedback(session_id, user_id):
    try:
        interview_data = await start_interview(session_id, user_id)
        question_docs = interview_data.get("questions", [])

        if not question_docs:
            raise HTTPException(status_code=404, detail="Questions not found")

        scoring_input = [
            {
                "question_id": question.get("question_id"),
                "question": question.get("question", ""),
                "user_answer": question.get("user_answer", "")
            }
            for question in question_docs
            if question.get("question_id")
        ]

        if not scoring_input:
            raise HTTPException(status_code=404, detail="Questions not found")

        updated_scores = []
        total_score = 0.0
        scored_count = 0

        for question_item in scoring_input:
            try:
                result = await generate_score_and_feedback([question_item])
            except Exception as exc:
                print(f"Scoring fallback for question {question_item.get('question_id')}: {exc}")
                result = [{
                    "question_id": question_item.get("question_id"),
                    "score": 0,
                    "ideal_answer": "",
                    "feedback": "Scoring unavailable"
                }]

            if not result:
                result = [{
                    "question_id": question_item.get("question_id"),
                    "score": 0,
                    "ideal_answer": "",
                    "feedback": "Scoring unavailable"
                }]

            if isinstance(result, list):
                item = next(
                    (
                        entry
                        for entry in result
                        if entry.get("question_id") == question_item.get("question_id")
                    ),
                    result[0],
                )
            else:
                item = result

            question_id = item.get("question_id")
            if not question_id:
                question_id = question_item.get("question_id")
            if not question_id:
                continue

            update_payload = {}

            if item.get("score") is not None:
                score_value = float(item.get("score"))
                update_payload["score"] = score_value
                total_score += score_value
                scored_count += 1

            if item.get("ideal_answer") is not None:
                update_payload["ideal_answer"] = item.get("ideal_answer")

            if item.get("feedback") is not None:
                update_payload["feedback"] = item.get("feedback")

            if update_payload:
                update_result = await question_Answer_collection.update_one(
                    {"_id": _to_object_id(question_id, "question_id")},
                    {"$set": update_payload}
                )

                if update_result.matched_count == 0:
                    raise HTTPException(status_code=404, detail=f"Question not found: {question_id}")

                updated_scores.append({"question_id": question_id, **update_payload})

        overall_score = round(total_score / scored_count, 2) if scored_count else 0.0

        #update overall score and status in session collection
        await session_collection.update_one(
            {"_id": _to_object_id(session_id, "session_id"), "user_id": user_id},
            {"$set": {"overall_score": overall_score, "status": "complete"}}
        )

        return {
            "session_id": session_id,
            "overall_score": overall_score,
            "updated_questions": updated_scores
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while generating score and feedback")


async def submit_interview(session_id, answers, user_id):
    try:
        interview_data = await _fetch_session_with_questions(session_id, user_id)
        valid_question_ids = {
            question["question_id"] for question in interview_data.get("questions", [])
        }

        for answer in answers:
            question_id = answer.get("questionId") or answer.get("question_id")
            user_answer = answer.get("answer", "")

            if not question_id or question_id not in valid_question_ids:
                continue

            update_result = await question_Answer_collection.update_one(
                {"_id": _to_object_id(question_id, "question_id")},
                {"$set": {"user_answer": user_answer}},
            )

            if update_result.matched_count == 0:
                raise HTTPException(status_code=404, detail=f"Question not found: {question_id}")

        return await save_score_and_feedback(session_id, user_id)
    except HTTPException:
        raise
    except Exception as exc:
        print(exc)
        raise HTTPException(status_code=500, detail="Error occurred while submitting interview")