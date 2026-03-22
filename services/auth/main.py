from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import os
from datetime import timedelta
# Assuming shared/auth/utils.py exists relative to the app's context
# In production, this might be a library or common folder in Docker
# For local dev, we'll import it relative or duplicate it if needed
# Let's duplicate it for now in each service's folder if it's easier to manage in Docker,
# but the user wanted a structured microservice repo.

# Reusing the shared logic (we can copy it into the service folder or use a shared lib)
from shared.auth.utils import hash_password, verify_password, create_access_token

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Microservice", version="1.0.0")

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = 60

@app.post("/signup", response_model=schemas.UserResponse)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)
    new_user = models.User(
        email=user.email,
        password=hashed_pwd,
        name=user.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "role": db_user.role
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
