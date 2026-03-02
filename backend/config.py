"""
Application configuration
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # AI Provider Configuration
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'groq').lower()  # 'openai' or 'groq'
    
    # OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'
    OPENAI_LLM_MODEL = 'gpt-4o-mini'
    
    # Groq
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    GROQ_LLM_MODEL = 'llama-3.3-70b-versatile'  # Fast and accurate
    
    # Dynamic model selection
    EMBEDDING_MODEL = OPENAI_EMBEDDING_MODEL  # Groq doesn't provide embeddings
    LLM_MODEL = GROQ_LLM_MODEL if AI_PROVIDER == 'groq' else OPENAI_LLM_MODEL
    
    # File uploads
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = {'pdf'}
    
    # Vector store
    VECTOR_STORE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vector_stores')
    
    # Database
    DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.db')
    
    # RAG settings
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    TOP_K_RETRIEVAL = 5
    TEMPERATURE = 0.1
