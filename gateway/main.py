from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from jose import JWTError, jwt
from typing import Optional

app = FastAPI(title="API Gateway", version="1.0.0")

# Define services and their URLs
SERVICES = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://localhost:8001"),
    "health": os.getenv("HEALTH_SERVICE_URL", "http://localhost:8002"),
    "career": os.getenv("CAREER_SERVICE_URL", "http://localhost:8003"),
    "relationship": os.getenv("RELATIONSHIP_SERVICE_URL", "http://localhost:8004"),
    "finance": os.getenv("FINANCE_SERVICE_URL", "http://localhost:8005"),
    "admin": os.getenv("ADMIN_SERVICE_URL", "http://localhost:8006"),
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
        # Remove content-length as it will be recalculated
        headers.pop("content-length", None)

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
            # For JSON responses, use JSONResponse to avoid streaming issues
            if "application/json" in response.headers.get("content-type", ""):
                return JSONResponse(
                    content=response.json(),
                    status_code=response.status_code
                )
            
            # For other types, use streaming but exclude problematic headers
            excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
            resp_headers = {
                k: v for k, v in response.headers.items() 
                if k.lower() not in excluded_headers
            }
            
            return StreamingResponse(
                response.aiter_raw(),
                status_code=response.status_code,
                headers=resp_headers
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable: {str(exc)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gateway error: {str(e)}")

@app.api_route("/{service_name}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service_name: str, path: str, request: Request, user_payload: Optional[dict] = Depends(verify_token)):
    # Public routes that don't need auth
    public_routes = [
        ("auth", "login"),
        ("auth", "signup"),
        ("health", "public"),
        ("health", "user/birth-data"),
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
