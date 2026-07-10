import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, init_db
from app.routers import ai, dashboard, employees, projects, seats
from app.seed import seed_database

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

APP_NAME = os.getenv("APP_NAME", "Ethara Seat Allocation API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
SEED_ON_STARTUP = os.getenv("SEED_ON_STARTUP", "true").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    if SEED_ON_STARTUP:
        db = SessionLocal()
        try:
            seed_result = seed_database(db)
            app.state.seed_result = seed_result
        finally:
            db.close()
    yield


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Production-ready Ethara Seat Allocation & Project Mapping API. "
        "Manage employees, projects, seats, allocations, analytics, and rule-based AI queries."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(employees.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(seats.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Ethara Seat Allocation System API is running",
        "docs": "/docs",
        "version": APP_VERSION,
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": APP_NAME, "version": APP_VERSION}


@app.post("/seed", tags=["Seed"])
def run_seed():
    db = SessionLocal()
    try:
        return seed_database(db)
    finally:
        db.close()
