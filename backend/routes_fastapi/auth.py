"""
Authentication routes for FastAPI
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from database import User
import jwt
from config import Config
from datetime import datetime, timedelta

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    user: dict

def create_access_token(user_id: int):
    """Create JWT access token"""
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    return token

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        print(f"[REGISTER] Attempting registration for: {request.email}")
        
        # Check if user exists
        existing_user = User.find_by_email(request.email)
        if existing_user:
            print(f"[REGISTER] Email already exists: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        print(f"[REGISTER] Creating new user...")
        # Create user
        user_id = User.create(request.email, request.password)
        print(f"[REGISTER] User created with ID: {user_id}")
        
        user = User.find_by_id(user_id)
        print(f"[REGISTER] Fetched user data")
        
        # Generate token
        access_token = create_access_token(user_id)
        print(f"[REGISTER] Token created, registration successful")
        
        return {
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[REGISTER ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user"""
    try:
        print(f"[LOGIN] Attempting login for: {request.email}")
        user = User.find_by_email(request.email)
        
        if not user:
            print(f"[LOGIN] User not found: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        print(f"[LOGIN] User found, verifying password...")
        if not User.verify_password(user, request.password):
            print(f"[LOGIN] Password verification failed")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        print(f"[LOGIN] Password verified, creating token...")
        access_token = create_access_token(user["id"])
        print(f"[LOGIN] Login successful for user ID: {user['id']}")
        
        return {
            "access_token": access_token,
            "user": {
                "id": user["id"],
                "email": user["email"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LOGIN ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
