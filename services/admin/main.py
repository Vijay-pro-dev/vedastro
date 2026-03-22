from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models, schemas

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Admin Microservice", version="1.0.0")

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

@app.get("/health")
def health_check():
    return {"status": "healthy"}
