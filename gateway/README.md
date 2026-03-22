# API Gateway

The central entry point for all requests to the microservices.

## Features
- Routing and Proxying
- Authentication (JWT Verification)
- Authorization (RBAC - Role Based Access Control)
- CORS and Security Headers
- HTTPS termination (when behind a load balancer)

## Architecture
- **Framework**: FastAPI
- **Proxy Client**: httpx (async)
- **Authentication**: Shared JWT

## How it Works
The gateway intercepts all requests to `/{service_name}/{path}`.
1. It verifies the JWT token if the route is protected.
2. It forwards the request to the target service.
3. It passes user payload via `X-User-Payload` header for downstream services.

## Production Readiness
- Dockerized
- Configurable via environment variables
- Scalable horizontally

## Local Development
1. Install dependencies: `pip install -r requirements.txt`
2. Run service: `uvicorn main:app --reload --port 8080`
