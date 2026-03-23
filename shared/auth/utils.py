
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-local-dev")
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

import httpx

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def log_user_activity(email: str, action: str, details: str = None, ip: str = None):
    """
    Utility to log user activity by calling the Auth service.
    This is async because it makes an external network call.
    """
    auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{auth_service_url}/activities/log",
                json={
                    "user_email": email,
                    "action": action,
                    "details": details,
                    "ip_address": ip
                },
                timeout=5.0
            )
    except Exception as e:
        # We don't want logging failures to crash the main application
        print(f"Failed to log activity for {email}: {e}")

