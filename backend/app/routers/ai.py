from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app import crud
from app.database import get_db
from app.models import Employee, EmployeeStatus, Project, Seat, SeatStatus
from app.schemas import AIQueryRequest, AIQueryResponse

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

INTENT_PATTERNS: list[tuple[str, list[str], float]] = [
    ("list_vacant_seats", [r"vacant", r"available", r"empty", r"free seat", r"unoccupied"], 0.92),
    ("list_allocated_seats", [r"allocated", r"occupied", r"assigned seat", r"taken seat"], 0.90),
    ("list_unassigned_employees", [r"unassigned", r"no seat", r"without seat", r"not allocated"], 0.91),
    ("show_employee_allocation", [r"employee", r"who sits", r"seat for", r"allocation for"], 0.85),
    ("show_project_utilization", [r"project utilization", r"project usage", r"project capacity", r"project stats"], 0.93),
    ("show_floor_utilization", [r"floor utilization", r"floor occupancy", r"floor usage", r"occupancy by floor"], 0.93),
    ("show_dashboard_summary", [r"summary", r"overview", r"dashboard", r"statistics", r"stats"], 0.88),
    ("list_project_employees", [r"project members", r"employees on project", r"team for project", r"staff on"], 0.87),
    ("list_seats_by_floor", [r"seats on floor", r"floor \d", r"show floor"], 0.86),
    ("list_maintenance_seats", [r"maintenance", r"under repair", r"out of service"], 0.90),
]


def _normalize_query(query: str) -> str:
    return re.sub(r"\s+", " ", query.strip().lower())


def _extract_floor(query: str) -> int | None:
    match = re.search(r"floor\s*(\d+)", query)
    if match:
        return int(match.group(1))
    match = re.search(r"\b(\d+)(?:st|nd|rd|th)\s*floor\b", query)
    if match:
        return int(match.group(1))
    return None


def _extract_project_code(query: str, db: Session) -> str | None:
    projects = db.query(Project).all()
    for project in projects:
        if project.project_code.lower() in query or project.name.lower() in query:
            return project.project_code
    match = re.search(r"project\s+([a-z0-9\-]+)", query)
    return match.group(1).upper() if match else None


def _extract_employee_identifier(query: str) -> str | None:
    match = re.search(r"emp[-\s]?(\d+)", query, re.IGNORECASE)
    if match:
        return f"EMP-{match.group(1).zfill(5)}"
    match = re.search(r"employee\s+([a-z0-9\-]+)", query, re.IGNORECASE)
    return match.group(1).upper() if match else None


def _detect_intent(query: str) -> tuple[str, float]:
    best_intent = "unknown"
    best_score = 0.0

    for intent, patterns, base_confidence in INTENT_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, query):
                if base_confidence > best_score:
                    best_intent = intent
                    best_score = base_confidence

    if best_intent == "unknown":
        return "unknown", 0.0
    return best_intent, best_score


def _serialize_seat(seat: Seat) -> dict[str, Any]:
    return {
        "seat_id": seat.id,
        "seat_code": seat.seat_code,
        "floor": seat.floor,
        "zone": seat.zone,
        "building": seat.building,
        "status": seat.status,
        "employee_id": seat.employee_id,
        "employee_name": seat.employee.name if seat.employee else None,
        "project_id": seat.project_id,
    }


def _serialize_employee(employee: Employee) -> dict[str, Any]:
    return {
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "name": employee.name,
        "email": employee.email,
        "department": employee.department,
        "team": employee.team,
        "project_id": employee.project_id,
        "seat_code": employee.allocated_seat.seat_code if employee.allocated_seat else None,
        "status": employee.status,
    }


def _execute_intent(db: Session, intent: str, query: str) -> tuple[list[dict], dict, str]:
    filters: dict[str, Any] = {}
    floor = _extract_floor(query)
    project_code = _extract_project_code(query, db)
    employee_code = _extract_employee_identifier(query)

    if floor is not None:
        filters["floor"] = floor
    if project_code:
        filters["project_code"] = project_code
    if employee_code:
        filters["employee_code"] = employee_code

    if intent == "list_vacant_seats":
        q = db.query(Seat).options(joinedload(Seat.employee)).filter(
            Seat.status == SeatStatus.AVAILABLE.value,
            Seat.employee_id.is_(None),
        )
        if floor is not None:
            q = q.filter(Seat.floor == floor)
        seats = q.order_by(Seat.floor, Seat.seat_code).limit(50).all()
        explanation = f"Found {len(seats)} vacant seats" + (f" on floor {floor}" if floor else "")
        return [_serialize_seat(s) for s in seats], filters, explanation

    if intent == "list_allocated_seats":
        q = db.query(Seat).options(joinedload(Seat.employee)).filter(Seat.employee_id.isnot(None))
        if floor is not None:
            q = q.filter(Seat.floor == floor)
        seats = q.order_by(Seat.floor, Seat.seat_code).limit(50).all()
        explanation = f"Found {len(seats)} allocated seats" + (f" on floor {floor}" if floor else "")
        return [_serialize_seat(s) for s in seats], filters, explanation

    if intent == "list_unassigned_employees":
        assigned_ids = db.query(Seat.employee_id).filter(Seat.employee_id.isnot(None)).subquery()
        employees = (
            db.query(Employee)
            .options(joinedload(Employee.allocated_seat), joinedload(Employee.project))
            .filter(Employee.status == EmployeeStatus.ACTIVE.value)
            .filter(~Employee.id.in_(assigned_ids))
            .order_by(Employee.name)
            .limit(50)
            .all()
        )
        explanation = f"Found {len(employees)} active employees without an allocated seat"
        return [_serialize_employee(e) for e in employees], filters, explanation

    if intent == "show_employee_allocation":
        employee: Employee | None = None
        if employee_code:
            employee = crud.get_employee_by_code(db, employee_code)
        else:
            name_match = re.search(r"(?:employee|for)\s+([a-z\s]+)", query)
            if name_match:
                term = f"%{name_match.group(1).strip()}%"
                employee = db.query(Employee).options(joinedload(Employee.allocated_seat)).filter(
                    Employee.name.ilike(term)
                ).first()
        if not employee:
            return [], filters, "Could not identify an employee from the query"
        return [_serialize_employee(employee)], filters, f"Allocation details for {employee.name}"

    if intent == "show_project_utilization":
        from app.routers.dashboard import get_project_utilization

        results = get_project_utilization(db)
        if project_code:
            results = [r for r in results if r.project_code == project_code]
        data = [r.model_dump() for r in results[:20]]
        explanation = "Project utilization metrics retrieved"
        return data, filters, explanation

    if intent == "show_floor_utilization":
        from app.routers.dashboard import get_floor_utilization

        results = get_floor_utilization(db)
        if floor is not None:
            results = [r for r in results if r.floor == floor]
        data = [r.model_dump() for r in results]
        explanation = "Floor utilization metrics retrieved"
        return data, filters, explanation

    if intent == "show_dashboard_summary":
        from app.routers.dashboard import get_dashboard_summary

        summary = get_dashboard_summary(db)
        return [summary.model_dump()], filters, "Dashboard summary retrieved"

    if intent == "list_project_employees":
        q = db.query(Employee).options(joinedload(Employee.allocated_seat)).filter(
            Employee.status == EmployeeStatus.ACTIVE.value
        )
        if project_code:
            project = crud.get_project_by_code(db, project_code)
            if project:
                q = q.filter(Employee.project_id == project.id)
                filters["project_id"] = project.id
        employees = q.order_by(Employee.name).limit(50).all()
        explanation = f"Found {len(employees)} employees" + (f" for project {project_code}" if project_code else "")
        return [_serialize_employee(e) for e in employees], filters, explanation

    if intent == "list_seats_by_floor":
        if floor is None:
            return [], filters, "Please specify a floor number in your query"
        seats = (
            db.query(Seat)
            .options(joinedload(Seat.employee))
            .filter(Seat.floor == floor)
            .order_by(Seat.seat_code)
            .limit(50)
            .all()
        )
        explanation = f"Found {len(seats)} seats on floor {floor}"
        return [_serialize_seat(s) for s in seats], filters, explanation

    if intent == "list_maintenance_seats":
        seats = (
            db.query(Seat)
            .filter(Seat.status == SeatStatus.MAINTENANCE.value)
            .order_by(Seat.floor, Seat.seat_code)
            .limit(50)
            .all()
        )
        explanation = f"Found {len(seats)} seats under maintenance"
        return [_serialize_seat(s) for s in seats], filters, explanation

    return [], filters, "Sorry, I could not understand your query. Try asking about vacant seats, floor utilization, or unassigned employees."


@router.post("/query", response_model=AIQueryResponse)
def process_ai_query(payload: AIQueryRequest, db: Session = Depends(get_db)):
    normalized = _normalize_query(payload.query)
    intent, confidence = _detect_intent(normalized)

    if intent == "unknown":
        return AIQueryResponse(
            query=payload.query,
            intent="unknown",
            confidence=0.0,
            filters={},
            explanation="Could not match query to a known intent. Supported topics: vacant seats, allocations, floor/project utilization, unassigned employees.",
            results=[],
            result_count=0,
        )

    results, filters, explanation = _execute_intent(db, intent, normalized)

    return AIQueryResponse(
        query=payload.query,
        intent=intent,
        confidence=confidence,
        filters=filters,
        explanation=explanation,
        results=results,
        result_count=len(results),
    )
