# Core Microservices

This directory contains the independent microservices that power the Vedastro platform.

## Services
- `auth-service/`: Handles user registration, login, and JWT generation.
- `health-service/`: Manages birth data and health-related estimations.
- `career-service/`: Tracks career profiles, alignment scores, and phase guidance.
- `relationship-service/`: Handles relationship tracking and compatibility (Skeleton).
- `finance-service/`: Manages financial records and analysis (Skeleton).
- `admin-service/`: Provides administrative logs and system monitoring (Skeleton).

## Design Principles
- **Independence**: Each service has its own database and codebase.
- **Scalability**: Services can be scaled horizontally and independently.
- **Resilience**: Failure in one service does not take down the entire system.
- **Health Checks**: Every service includes a `/health` endpoint for monitoring.
- **Shared Logic**: Common utilities like auth hashing are in the `shared/` directory.

## Production Guidelines
- Use PostgreSQL or another robust DB instead of SQLite in production.
- Configure secrets via environment variables (SECRET_KEY, DATABASE_URL).
- Implement service mesh or circuit breakers for advanced production setups.
