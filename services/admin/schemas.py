from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdminLogBase(BaseModel):
    admin_id: int
    action: str
    resource: str
    details: Optional[str] = None

class AdminLogCreate(AdminLogBase):
    pass

class AdminLog(AdminLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: str
    password: str

