from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RelationshipRecordBase(BaseModel):
    user_id: int
    status: str
    notes: Optional[str] = None

class RelationshipRecordCreate(RelationshipRecordBase):
    pass

class RelationshipRecord(RelationshipRecordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
