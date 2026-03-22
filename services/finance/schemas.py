from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FinanceRecordBase(BaseModel):
    user_id: int
    amount: float
    category: str
    description: Optional[str] = None

class FinanceRecordCreate(FinanceRecordBase):
    pass

class FinanceRecord(FinanceRecordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
