# Health Microservice

This service handles health-related data, specifically birth data and estimations.

## Features
- Birth data management
- Birth time estimation questionnaire
- AI-driven birth time estimation

## Architecture
- **Framework**: FastAPI
- **Database**: PostgreSQL (Production) / SQLite (Local)
- **ORM**: SQLAlchemy
- **Authentication**: Shared JWT via API Gateway

## Production Readiness
- Dockerized
- Configurable via environment variables
- Health check endpoints
- Horizontal scalability

## Local Development
1. Install dependencies: `pip install -r requirements.txt`
2. Run service: `uvicorn main:app --reload --port 8000`
