from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class CareerProfile(BaseModel):
    user_id: Optional[int] = None
    education: str
    interests: str
    goals: str

class CareerAlignmentScore(BaseModel):
    user_id: int
    awareness_score: float = Field(..., ge=0, le=100)
    time_alignment_score: float = Field(..., ge=0, le=100)
    action_integrity_score: float = Field(..., ge=0, le=100)

class CareerPhase(BaseModel):
    user_id: int
    phase_name: str
    phase_start_date: str
    phase_end_date: str
    description: str = ""

class OpportunityWindow(BaseModel):
    user_id: int
    window_start_date: str
    window_end_date: str
    opportunity_type: str
    confidence_level: float = Field(..., ge=0, le=100)
    description: str = ""

class DecisionGuidance(BaseModel):
    user_id: int
    guidance_id: str
    focus: str
    avoid: str
    reason: str
    recommendations: List[str] = []

class ActivityLog(BaseModel):
    user_id: int
    activity_type: str
    description: str
    data: Optional[Dict[str, Any]] = None

class CareerScore(BaseModel):
    user_id: int
    score: int
    date: str

class FeedbackDecision(BaseModel):
    user_id: int
    decision: str
    notes: Optional[str] = None

class FeedbackOutcome(BaseModel):
    user_id: int
    result: str
    comments: Optional[str] = None
