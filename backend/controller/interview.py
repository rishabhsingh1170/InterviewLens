from bson import ObjectId

from models.sesion_schema import SessionCreate
from models.question_answer_schema import QuestionsAnswers
from database import session_collection, question_Answer_collection, user_collection
from fastapi import HTTPException
from llm_servies.question_generation import generate_question, generate_score_and_feedback

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
        #  fetch session
        session = await session_collection.find_one({
            "_id": ObjectId(session_id),
            "user_id": user_id   # keep consistent with DB (string)
        })

        if not session:
            raise HTTPException(status_code=404, detail="Interview session not found")

        question_ids = session.get("questions", [])

        questions = []

        for question_id in question_ids:
            q = await question_Answer_collection.find_one(
                {"_id": ObjectId(question_id)}
            )

            if q:
                questions.append({
                    "question_id": str(q["_id"]),   # convert ObjectId
                    "question": q.get("question", ""),
                    "ideal_answer": q.get("ideal_answer", ""),
                    "user_answer": q.get("user_answer", ""),
                    "score": q.get("score", 0.0),
                    "feedback": q.get("feedback", "")
                })

        return {
            "session_id": session_id,
            "topic": session.get("topic"),
            "level": session.get("level"),
            "questions": questions
        }

    except HTTPException:
        raise

    except Exception as e:
        print("ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# save user answer of a question    
async def save_answer( question_id, user_answer):
    try:
        result = await question_Answer_collection.update_one(
            {"_id": ObjectId(question_id)},
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
async def save_score_and_feedback(question_id):
    try:
        "Fetch the question and user answer from the database using question_id"
        question_doc = await question_Answer_collection.find_one({"_id": ObjectId(question_id)})
        if not question_doc:
            raise HTTPException(status_code=404, detail="Question not found")

        result = await generate_score_and_feedback({
            "question_id": question_id,
            "question": question_doc.get("question", ""),
            "user_answer": question_doc.get("user_answer", "")
        })
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate score and feedback")
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error occurred while generating score and feedback")