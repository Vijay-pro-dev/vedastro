from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from database import Base

class UserInfo(Base):
    __tablename__ = "userinfo"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    dob = Column(String)
    birth_time = Column(String)
    contact = Column(String)


class BirthData(Base):
    __tablename__ = "birth_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    name = Column(String)
    dob = Column(String)
    birth_time = Column(String)
    birth_place = Column(String)
    birth_time_accuracy = Column(String, default="unknown")  # exact, approximate, unknown, estimated_by_ai
    address = Column(String, nullable=True)
    profile_pic = Column(String, nullable=True)

class BirthTimeEstimate(Base):
    __tablename__ = "birth_time_estimates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    questionnaire_responses = Column(Text)  # JSON string of responses
    estimated_time = Column(String)
    confidence_score = Column(Float)  # 0-100
    created_at = Column(DateTime, default=datetime.utcnow)
