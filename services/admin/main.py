from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas
import httpx
import os
from shared.auth.utils import log_user_activity

# Initialize database
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Admin Microservice", version="1.0.0")

# Constants
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Admin Service"}

@app.post("/login")
async def admin_login(user_credentials: schemas.AdminLogin):
    try:
        async with httpx.AsyncClient() as client:
            # Forward login request to Auth service
            response = await client.post(
                f"{AUTH_SERVICE_URL}/login",
                json={
                    "email": user_credentials.email,
                    "password": user_credentials.password
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid admin credentials")
            
            auth_data = response.json()
            user_info = auth_data.get("user", {})
            
            # Check if the user is actually an admin
            if user_info.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Access denied: Not an admin account")
            
            return auth_data
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail="Authentication service unavailable")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/stats")
async def get_dashboard_stats():
    # In a real app, we'd extract user from token. For simplicity, we'll log as admin.
    await log_user_activity("admin-system", "View Dashboard Stats", "Admin accessed system stats")
    
    # Call Auth service for user stats
    try:
        async with httpx.AsyncClient() as client:
            auth_stats_res = await client.get(f"{AUTH_SERVICE_URL}/users/stats")
            auth_stats = auth_stats_res.json()
    except Exception as e:
        # Fallback stats if Auth service is down
        auth_stats = {
            "total_users": 0,
            "users_signed_up": 0,
            "users_online": 0
        }
    
    return {
        "stats": auth_stats,
        "system_status": "Operational"
    }

@app.get("/dashboard/activities")
async def get_dashboard_activities(db: Session = Depends(get_db)):
    # Call Auth service for user activities
    try:
        async with httpx.AsyncClient() as client:
            auth_activities_res = await client.get(f"{AUTH_SERVICE_URL}/users/activities")
            auth_activities = auth_activities_res.json()
    except Exception as e:
        auth_activities = []
    
    # Get internal admin logs
    admin_logs = db.query(models.AdminLog).order_by(models.AdminLog.created_at.desc()).limit(10).all()
    
    return {
        "user_activities": auth_activities,
        "admin_logs": admin_logs
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

