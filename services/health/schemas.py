from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional, Dict, Any

class UserInfo(BaseModel):
    name: str
    dob: str
    birth_time: str
    contact: str

class BirthTimeAccuracyEnum(str, Enum):
    exact = "exact"
    approximate = "approximate"
    unknown = "unknown"
    estimated_by_ai = "estimated_by_ai"
    estimated = "estimated"

class BirthData(BaseModel):
    user_id: Optional[int] = None
    name: Optional[str] = None
    dob: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    birth_time: str = Field(..., description="Time of birth (HH:MM)")
    birth_place: str = Field(..., description="Birth city/location")
    birth_time_accuracy: BirthTimeAccuracyEnum = BirthTimeAccuracyEnum.unknown
    address: Optional[str] = None
    user_email: Optional[str] = None
    profile_pic: Optional[str] = None

class BirthTimeQuestionnaire(BaseModel):
    user_id: int
    life_turning_points: str
    major_changes_timing: str
    significant_events: str
    career_transitions: str
    health_events: str

class BirthTimeEstimate(BaseModel):
    user_id: int
    questionnaire_responses: Dict[str, Any]
    estimated_time: str
    confidence_score: float = Field(..., ge=0, le=100)
