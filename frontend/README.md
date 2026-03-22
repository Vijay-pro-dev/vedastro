# Frontend Application

A React-based frontend for the Vedastro platform.

## Features
- User Authentication (Login/Signup)
- Dashboard for Health, Career, and other services.
- User profile management.
- Responsive UI with Vite and React.

## Integration
- Communicates with the API Gateway at `http://localhost:8080`.
- All requests are proxied via the Gateway to the appropriate microservices.
- Uses JWT from Auth service for authenticated requests.

## Production Readiness
- Optimized build with Vite.
- Served via Nginx (Dockerized).
- Configurable API Gateway URL via environment variables.

## Local Development
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`
