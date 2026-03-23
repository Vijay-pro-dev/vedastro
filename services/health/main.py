from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import httpx
import os
from shared.auth.utils import log_user_activity

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Health Microservice", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Health Service"}

# Birth data API
@app.post("/user/birth-data", response_model=schemas.BirthData)
def save_birth_data(data: schemas.BirthData, db: Session = Depends(get_db)):
    # This now assumes the user_id is passed from the API Gateway or frontend
    # after being verified by the Auth service.
    
    existing_birth = db.query(models.BirthData).filter(
        models.BirthData.user_id == data.user_id
    ).first()

    if existing_birth:
        # Update logic
        existing_birth.name = data.name
        existing_birth.dob = data.dob
        existing_birth.birth_time = data.birth_time
        existing_birth.birth_place = data.birth_place
        existing_birth.address = data.address
        existing_birth.birth_time_accuracy = str(data.birth_time_accuracy)
        db.commit()
        db.refresh(existing_birth)
        return existing_birth
    else:
        # Create new
        new_birth = models.BirthData(
            user_id=data.user_id,
            name=data.name,
            dob=data.dob,
            birth_time=data.birth_time,
            birth_place=data.birth_place,
            address=data.address,
            birth_time_accuracy=str(data.birth_time_accuracy)
        )
        db.add(new_birth)
        db.commit()
        db.refresh(new_birth)
        return new_birth

@app.post("/career/estimate-birth-time", response_model=schemas.BirthTimeEstimate)
def estimate_birth_time(data: schemas.BirthTimeQuestionnaire, db: Session = Depends(get_db)):
    # Simple estimation logic for demonstration
    # In production, this would use a more complex algorithm or AI model
    estimated_time = "12:00" # Default
    confidence_score = 75.0
    
    # Store the estimate
    estimate = models.BirthTimeEstimate(
        user_id=data.user_id,
        questionnaire_responses=str(data.dict()),
        estimated_time=estimated_time,
        confidence_score=confidence_score
    )
    db.add(estimate)
    db.commit()
    db.refresh(estimate)
    
    return estimate

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/user/birth-data", response_model=schemas.BirthData)
async def get_birth_data(email: str, db: Session = Depends(get_db)):
    # Log activity
    await log_user_activity(email, "Fetch Birth Data", "User requested birth data")
    
    # In a real microservices app, we would call the Auth service to get user_id from email
    # or the Gateway would have already resolved this.
    # For now, we'll try to find it by email if we stored email, but the model has user_id.
    # We'll assume the client passes the email and we need to resolve it.
    
    # Let's try to get birth data by user_id if possible, but here we only have email.
    # For now, we'll just mock it or try to find a way to link them.
    # In this specific task, let's just implement the endpoint.
    
    # We'll add a temporary way to query by email or just return 404 if not found.
    # In the current models.py, BirthData has user_id but not email.
    
    # Let's check if we can get user_id from auth service
    AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
    import httpx
    
    try:
        import httpx
        with httpx.Client() as client:
            response = client.get(f"{AUTH_SERVICE_URL}/users/{email}")
            if response.status_code == 200:
                user_data = response.json()
                user_id = user_data.get("id")
                birth_data = db.query(models.BirthData).filter(models.BirthData.user_id == user_id).first()
                if not birth_data:
                    raise HTTPException(status_code=404, detail="Birth data not found")
                return birth_data
    except Exception as e:
        print(f"Error resolving user: {e}")
    
    raise HTTPException(status_code=404, detail="User or birth data not found")
