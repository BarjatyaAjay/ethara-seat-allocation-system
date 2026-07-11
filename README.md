# Ethara Seat Allocation System

A modern full-stack Seat Allocation Management System built for efficient employee workspace allocation, project management, and AI-assisted seat assignment.

---

##  Overview

Ethara Seat Allocation System is an enterprise-ready web application that helps organizations efficiently manage:

- 👨‍💼 Employees
- 💺 Seat Allocation
- 📁 Projects
- 📊 Dashboard Analytics
- 🤖 AI Assistant for Seat Management

The system provides a clean dashboard with real-time statistics, intelligent seat allocation, and powerful search capabilities.

---

#  Features

## 📊 Dashboard

- Total Employees
- Total Seats
- Available Seats
- Occupied Seats
- Project Statistics
- Occupancy Summary

---

##  Employee Management

- View Employees
- Search Employees
- Add Employee
- Edit Employee
- Delete Employee
- Department Management
- Seat Assignment Information

---

## Project Management

- View Projects
- Search Projects
- Add Projects
- Edit Projects
- Delete Projects
- Required Seat Tracking

---

## Seat Management

- View Seats
- Allocate Seat
- Release Seat
- Auto Seat Allocation
- Seat Availability Status

---

## AI Assistant

Natural language interface for seat management.

Example queries:

- Show available seats
- Dashboard summary
- Project utilization
- Find unassigned employees
- Auto allocate seat

---

# Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router
- React Icons

## Backend

- FastAPI
- SQLAlchemy
- Pydantic

## Database

- SQLite

---

# Project Structure

```
Ethara_Seat_Allocation/

├── backend/
│   ├── app/
│   ├── database.py
│   ├── models.py
│   ├── routers/
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

# Screenshots

## Dashboard

(Add Screenshot)

---

## Employees

(Add Screenshot)

---

## Projects

(Add Screenshot)

---

## Seats

(Add Screenshot)

---

## AI Assistant

(Add Screenshot)

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/BarjatyaAjay/ethara-seat-allocation-system.git
```

```
cd ethara-seat-allocation-system
```

---

## Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
```

Run frontend

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 📡 API Endpoints

## Employees

```
GET /api/v1/employees

POST /api/v1/employees

PUT /api/v1/employees/{id}

DELETE /api/v1/employees/{id}
```

---

## Projects

```
GET /api/v1/projects

POST /api/v1/projects

PUT /api/v1/projects/{id}

DELETE /api/v1/projects/{id}
```

---

## Seats

```
GET /api/v1/seats

POST /api/v1/seats/allocate

POST /api/v1/seats/release

POST /api/v1/seats/auto-allocate/{employee_id}
```

---

## Dashboard

```
GET /api/v1/dashboard/summary
```

---

## AI Assistant

```
POST /api/v1/ai/query
```

---

# Future Improvements

- Authentication
- Role Based Access
- Email Notifications
- Floor Map Visualization
- Dark Mode
- Cloud Deployment
- PostgreSQL Support
- Docker Support
- Kubernetes Deployment

---

# Author

**Ajay Bairwa**

GitHub

https://github.com/BarjatyaAjay

---
