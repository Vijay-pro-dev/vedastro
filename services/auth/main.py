from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import os
from datetime import timedelta, datetime
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
    
    # Update last login and is_online
    db_user.last_login = datetime.utcnow()
    db_user.is_online = True
    db.commit()

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

@app.get("/users/stats")
def get_user_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    users_signed_up = db.query(models.User).count() # This is the same as total_users for now
    users_online = db.query(models.User).filter(models.User.is_online == True).count()
    
    return {
        "total_users": total_users,
        "users_signed_up": users_signed_up,
        "users_online": users_online
    }

@app.get("/users/activities")
def get_user_activities(db: Session = Depends(get_db)):
    # Return recent user signups and logins
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(10).all()
    activities = []
    for user in recent_users:
        activities.append({
            "user": user.email,
            "action": "Signed Up",
            "timestamp": user.created_at
        })
        if user.last_login:
            activities.append({
                "user": user.email,
                "action": "Logged In",
                "timestamp": user.last_login
            })
    
    # Sort all by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    return activities[:20]

@app.get("/users/{email}")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
