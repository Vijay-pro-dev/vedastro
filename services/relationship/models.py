from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from database import Base

class RelationshipRecord(Base):
    __tablename__ = "relationship_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    status = Column(String)
    notes = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
