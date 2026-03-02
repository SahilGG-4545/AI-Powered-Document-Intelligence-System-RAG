"""
Chat routes for FastAPI
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
from database import ChatHistory
from utils.rag_pipeline import RAGPipeline
from .dependencies import get_current_user

router = APIRouter()

class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

@router.post("/query")
async def query(request: QueryRequest, user_id: int = Depends(get_current_user)):
    """Process a query using RAG"""
    try:
        question = request.question.strip()
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question is required"
            )
        
        # Create session_id if not provided
        session_id = request.session_id or str(uuid.uuid4())
        
        # Process query using RAG
        rag = RAGPipeline(user_id, session_id=session_id)
        result = rag.query(question)
        
        # Save to chat history
        ChatHistory.create(
            user_id=user_id,
            question=question,
            answer=result['answer'],
            sources=result['sources'],
            session_id=session_id
        )
        
        return {
            'question': question,
            'answer': result['answer'],
            'sources': result['sources'],
            'session_id': session_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query failed: {str(e)}"
        )

@router.get("/history")
async def get_history(limit: int = 50, user_id: int = Depends(get_current_user)):
    """Get chat history for current user"""
    try:
        history = ChatHistory.get_by_user(user_id, limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )

@router.get("/sessions")
async def get_sessions(user_id: int = Depends(get_current_user)):
    """Get all chat sessions for current user"""
    try:
        sessions = ChatHistory.get_sessions(user_id)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}")
async def get_session_history(session_id: str, user_id: int = Depends(get_current_user)):
    """Get chat history for a specific session"""
    try:
        history = ChatHistory.get_by_session(user_id, session_id)
        return {"history": history, "session_id": session_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch session history: {str(e)}"
        )

@router.delete("/history")
async def clear_history(user_id: int = Depends(get_current_user)):
    """Clear all chat history for current user"""
    try:
        deleted_count = ChatHistory.delete_by_user(user_id)
        return {
            "message": "Chat history cleared successfully",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear history: {str(e)}"
        )
