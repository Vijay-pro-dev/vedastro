# Vedastro Microservices Platform

A production-ready microservices architecture for the Vedastro ecosystem, featuring a centralized API Gateway, multiple specialized microservices, and a modern React frontend.

## 🚀 Project Structure
- `gateway/`: Entry point for all API requests. Handles routing and security.
- `services/`:
  - `auth/`: User registration, login, and JWT generation.
  - `health/`: Birth data and health-related analytics.
  - `career/`: Career guidance and profile management.
  - `relationship/`: Relationship compatibility and logs.
  - `finance/`: Financial records and predictions.
  - `admin/`: System monitoring and activity logs.
- `frontend/`: React + Vite application with Tailwind CSS.
- `shared/`: Common authentication utilities used by all microservices.

---

## 🛠️ Local Setup Instructions

Follow these steps to get the entire platform running on your local machine.

### **Prerequisites**
- **Python 3.10+**: For backend services.
- **Node.js 18+**: For the frontend.
- **Git**: To clone the repository.

### **1. Clone the Repository**
```bash
git clone https://github.com/Vijay-pro-dev/vedastro.git
cd vedastro
```

### **2. Backend Setup (Microservices)**

You need to install dependencies for each service. It is recommended to use a virtual environment.

#### **Install Dependencies**
Run the following commands from the project root:
```bash
# Install common utilities
pip install -r services/auth/requirements.txt
pip install -r services/health/requirements.txt
pip install -r services/career/requirements.txt
pip install -r services/relationship/requirements.txt
pip install -r services/finance/requirements.txt
pip install -r services/admin/requirements.txt
pip install -r gateway/requirements.txt
```

#### **Configure Environment Variables**
Every backend terminal needs these variables. You can set them in a `.env` file or export them directly:
- `SECRET_KEY`: A secure random string for JWT (e.g., `your-secret-key-for-local-dev`).
- `DATABASE_URL`: Connection string for PostgreSQL (Neon) or SQLite.
  - **Neon (Recommended)**: `postgresql://user:pass@host/db?sslmode=require`
  - **SQLite (Fallback)**: `sqlite:///D:/path/to/your/auth.db` (Use absolute paths).

#### **Start Microservices**
Open a terminal and start all services (you can use multiple terminals or background processes):
```bash
# Example for Auth Service
cd services/auth
export PYTHONPATH="../../"
export SECRET_KEY=your-secret-key
export DATABASE_URL=your-db-url
python -m uvicorn main:app --port 8001
```
Repeat for ports: **8002 (Health)**, **8003 (Career)**, **8004 (Relationship)**, **8005 (Finance)**, **8006 (Admin)**.

### **3. API Gateway Setup**
The Gateway routes traffic from the frontend to the correct microservice.
```bash
cd gateway
export AUTH_SERVICE_URL=http://localhost:8001
export HEALTH_SERVICE_URL=http://localhost:8002
export CAREER_SERVICE_URL=http://localhost:8003
export RELATIONSHIP_SERVICE_URL=http://localhost:8004
export FINANCE_SERVICE_URL=http://localhost:8005
export ADMIN_SERVICE_URL=http://localhost:8006
python -m uvicorn main:app --port 8080
```

### **4. Frontend Setup**
```bash
cd frontend
npm install
export VITE_API_GATEWAY_URL=http://localhost:8080
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 🐳 Running with Docker (Quickest)
If you have Docker installed, you can start everything with one command:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:5173`
- **Gateway**: `http://localhost:8080`

---

## 🔐 Admin Access
- **Admin Email**: `inderkumarsingh@gmail.com`
- **Admin Password**: `Pass@1234`
- **Admin Dashboard**: Once logged in, click the **"Admin Dashboard"** button on the home page or navigate to `/admin/dashboard`.

---

## 📈 Activity Logging
All user actions (Login, Signup, Data fetching) are automatically logged in the `activity_logs` table in the database and can be viewed in real-time on the Admin Dashboard.

## ☁️ Deployment
- **Frontend**: Pre-configured for **Vercel** (`frontend/vercel.json`).
- **Backend**: Pre-configured for **Render** via the blueprint (`render.yaml`).
- **Database**: Compatible with **Neon PostgreSQL**.
