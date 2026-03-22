# Auth Microservice

The authentication and authorization service for the Vedastro ecosystem.

## Features
- User registration (Signup)
- User authentication (Login)
- JWT token generation (HS256)
- Password hashing (bcrypt)
- RBAC (Role Based Access Control)

## Architecture
- **Framework**: FastAPI
- **Database**: PostgreSQL (Production) / SQLite (Local)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)

## Production Readiness
- Dockerized
- Configurable via environment variables
- Health check endpoints
- Minimal dependencies

## Local Development
1. Install dependencies: `pip install -r requirements.txt`
2. Run service: `uvicorn main:app --reload --port 8001`
