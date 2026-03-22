FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Environment variables
ENV PORT=8080
ENV SECRET_KEY="replace-me-in-production"
ENV AUTH_SERVICE_URL="http://auth-service:8000"
ENV HEALTH_SERVICE_URL="http://health-service:8000"
ENV CAREER_SERVICE_URL="http://career-service:8000"
ENV RELATIONSHIP_SERVICE_URL="http://relationship-service:8000"
ENV FINANCE_SERVICE_URL="http://finance-service:8000"
ENV ADMIN_SERVICE_URL="http://admin-service:8000"

EXPOSE 8080

# Using uvicorn to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
