# Ethara Seat Allocation System

A full-stack workspace management application for tracking employees, projects, and seat allocations across office buildings.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, TailwindCSS, Recharts |
| Backend  | FastAPI, SQLAlchemy, SQLite         |
| State    | React hooks, Axios                  |
| UI       | react-hot-toast, react-icons        |

## Features

### Dashboard
- Occupancy summary cards (employees, seats, projects)
- Department-wise employee distribution chart
- Floor and project utilization charts
- Seat distribution pie chart
- Recent activity feed

### Employees
- Full CRUD (add, edit, delete with confirmation)
- Server-side pagination and multi-field search
- Loading states, empty states, toast notifications

### Projects
- Full CRUD with validation
- Search and pagination

### Seats
- Allocate and release seats
- Filter by building, floor, and status
- Search by seat code, zone, or building

### AI Assistant
- Chat-style interface with message history
- Natural language queries for seats, employees, utilization
- Auto seat allocation by employee ID
- Structured result tables

## Project Structure

```
Ethera_Seat_Allocation/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── crud.py              # Database operations
│   │   ├── seed.py              # Database seeder
│   │   ├── routers/             # API route handlers
│   │   └── services/            # Business logic
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── charts/          # Recharts visualizations
        │   ├── dashboard/       # Dashboard widgets
        │   ├── employees/       # Employee modals
        │   ├── projects/        # Project modals
        │   ├── seats/           # Seat allocation modals
        │   ├── layout/          # Navbar, Sidebar
        │   └── ui/              # Shared UI components
        ├── pages/               # Route pages
        └── services/            # API client
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed          # Seed database (5000 employees)
python -m uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000` — docs at `/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Development server at http://localhost:5173
npm run build    # Production build
```

## API Endpoints

| Resource   | Endpoints                                              |
|------------|--------------------------------------------------------|
| Employees  | `GET/POST /employees`, `PUT/DELETE /employees/{id}`    |
| Projects   | `GET/POST /projects`, `PUT/DELETE /projects/{id}`      |
| Seats      | `GET/POST /seats`, `POST /seats/allocate`, `/release`  |
| Dashboard  | `/summary`, `/department-stats`, `/floor-utilization`  |
| AI         | `POST /ai/query`                                       |

All endpoints are prefixed with `/api/v1`.

## License

MIT
