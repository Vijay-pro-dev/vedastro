FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared library
# Assuming shared folder is at the root and copied during build
# For simplicity, we'll use PYTHONPATH
COPY . .

# Environment variables
ENV PORT=8000
ENV DATABASE_URL="sqlite:///./auth.db"
ENV SECRET_KEY="replace-me-in-production"
ENV PYTHONPATH="/app:/app/.."

EXPOSE 8000

# Using uvicorn to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
