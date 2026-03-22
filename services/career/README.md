# Career Microservice

This service handles career-related data and functionalities.

## Features
- Career records management
- User-specific career tracking
- Industry analysis (planned)

## Architecture
- **Framework**: FastAPI
- **Database**: PostgreSQL (Production) / SQLite (Local)
- **ORM**: SQLAlchemy
- **Authentication**: Shared JWT via API Gateway

## Production Readiness
- Dockerized for container orchestration
- Configurable via environment variables
- Health check endpoints
- Minimal dependencies for faster startup
- Scalable horizontally

## Local Development
1. Install dependencies: `pip install -r requirements.txt`
2. Run service: `uvicorn main:app --reload --port 8002`
