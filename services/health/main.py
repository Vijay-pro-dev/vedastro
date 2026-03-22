from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import os

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
