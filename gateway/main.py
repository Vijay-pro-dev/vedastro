from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from jose import JWTError, jwt
from typing import Optional

app = FastAPI(title="API Gateway", version="1.0.0")

# Service URLs (configurable via environment)
SERVICES = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000"),
    "health": os.getenv("HEALTH_SERVICE_URL", "http://health-service:8000"),
    "career": os.getenv("CAREER_SERVICE_URL", "http://career-service:8000"),
    "relationship": os.getenv("RELATIONSHIP_SERVICE_URL", "http://relationship-service:8000"),
    "finance": os.getenv("FINANCE_SERVICE_URL", "http://finance-service:8000"),
    "admin": os.getenv("ADMIN_SERVICE_URL", "http://admin-service:8000"),
}

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-local-dev")
ALGORITHM = "HS256"

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT verification dependency
async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # Some endpoints might be public (like login/signup)
        # We handle this in the proxy logic or specific routes
        return None
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

# Proxy logic
async def proxy_request(service_name: str, path: str, request: Request, user_payload: Optional[dict] = None):
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service not found")
    
    target_url = f"{SERVICES[service_name]}/{path}"
    
    # Forward query parameters
    if request.query_params:
        target_url += f"?{request.query_params}"

    async with httpx.AsyncClient() as client:
        # Prepare headers (forward everything, but maybe add user info)
        headers = dict(request.headers)
        if user_payload:
            headers["X-User-Payload"] = str(user_payload)
            
        # Remove host header to avoid conflicts
        headers.pop("host", None)

        try:
            # Prepare request body
            body = await request.body()
            
            # Forward the request
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                timeout=30.0
            )
            
            # Return the response from the service
            return StreamingResponse(
                response.aiter_raw(),
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable: {str(exc)}")

@app.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service_name: str, path: str, request: Request, user_payload: Optional[dict] = Depends(verify_token)):
    # Public routes that don't need auth
    public_routes = [
        ("auth", "login"),
        ("auth", "signup"),
        ("health", "public"),
    ]
    
    is_public = (service_name, path) in public_routes or path.startswith("health") # Example: /health/ is public
    
    if not is_public and not user_payload:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    return await proxy_request(service_name, path, request, user_payload)

@app.get("/")
def read_root():
    return {"message": "API Gateway is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
