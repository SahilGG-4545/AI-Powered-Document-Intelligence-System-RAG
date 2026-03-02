"""
FastAPI application entry point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import Config
from routes_fastapi import auth, documents, chat
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    # Startup
    init_db()
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(Config.VECTOR_STORE_PATH, exist_ok=True)
    yield
    # Shutdown (if needed)

def create_app():
    """Application factory"""
    app = FastAPI(
        title="DocIntel AI API",
        description="Intelligent Document Analysis with RAG",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Register routers
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
    app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
    
    @app.get("/api/health")
    async def health_check():
        return {"status": "healthy", "message": "API is running"}
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
