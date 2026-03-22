from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_online: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityLogCreate(BaseModel):
    user_email: str
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None

class ActivityLog(ActivityLogCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

