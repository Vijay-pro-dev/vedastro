# Vedastro Microservices Platform

A production-ready microservices architecture for the Vedastro ecosystem.

## Project Structure
- `gateway/`: API Gateway for routing, auth, and security.
- `services/`: Core microservices (Auth, Health, Career, Relationship, Finance, Admin).
- `frontend/`: React-based frontend application.
- `shared/`: Common libraries and utilities used across services.

## Architecture Highlights
- **Microservices**: Independent services with their own databases.
- **API Gateway**: Single entry point with JWT-based authentication.
- **Dockerized**: Every component is containerized for consistent deployment.
- **Cloud Ready**: Minimal changes needed for AWS, Azure, or GCP.
- **Free-Tier Friendly**: Optimized for deployment on Render, Railway, or Vercel.

## Quick Start
1. Ensure Docker and Docker Compose are installed.
2. Run `docker-compose up --build`.
3. Access the Gateway at `http://localhost:8080` and Frontend at `http://localhost:5173`.

## Security
- JWT for authentication and authorization.
- HTTPS termination at the gateway level.
- Environment-based configuration for secrets.
