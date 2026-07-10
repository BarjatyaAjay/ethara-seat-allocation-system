from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Employee, EmployeeStatus, Project, ProjectStatus, Seat, SeatStatus
from app.schemas import DashboardSummary, FloorUtilization, ProjectUtilization

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    active_employees = (
        db.query(func.count(Employee.id)).filter(Employee.status == EmployeeStatus.ACTIVE.value).scalar() or 0
    )
    allocated_seats = db.query(func.count(Seat.id)).filter(Seat.employee_id.isnot(None)).scalar() or 0
    unassigned_employees = active_employees - allocated_seats

    total_seats = db.query(func.count(Seat.id)).scalar() or 0
    available_seats = (
        db.query(func.count(Seat.id))
        .filter(Seat.status == SeatStatus.AVAILABLE.value, Seat.employee_id.is_(None))
        .scalar()
        or 0
    )
    maintenance_seats = (
        db.query(func.count(Seat.id)).filter(Seat.status == SeatStatus.MAINTENANCE.value).scalar() or 0
    )

    total_projects = db.query(func.count(Project.id)).scalar() or 0
    active_projects = (
        db.query(func.count(Project.id)).filter(Project.status == ProjectStatus.ACTIVE.value).scalar() or 0
    )

    occupancy_rate = round((allocated_seats / total_seats * 100) if total_seats else 0.0, 2)

    return DashboardSummary(
        total_employees=total_employees,
        active_employees=active_employees,
        unassigned_employees=max(unassigned_employees, 0),
        total_seats=total_seats,
        allocated_seats=allocated_seats,
        available_seats=available_seats,
        maintenance_seats=maintenance_seats,
        total_projects=total_projects,
        active_projects=active_projects,
        occupancy_rate=occupancy_rate,
    )


@router.get("/project-utilization", response_model=list[ProjectUtilization])
def get_project_utilization(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.priority.desc(), Project.name).all()
    results: list[ProjectUtilization] = []

    for project in projects:
        assigned_employees = (
            db.query(func.count(Employee.id))
            .filter(Employee.project_id == project.id, Employee.status == EmployeeStatus.ACTIVE.value)
            .scalar()
            or 0
        )
        allocated_seats = (
            db.query(func.count(Seat.id))
            .filter(Seat.project_id == project.id, Seat.employee_id.isnot(None))
            .scalar()
            or 0
        )

        utilization_rate = round(
            (assigned_employees / project.required_seats * 100) if project.required_seats else 0.0,
            2,
        )
        seat_fulfillment_rate = round(
            (allocated_seats / project.required_seats * 100) if project.required_seats else 0.0,
            2,
        )

        results.append(
            ProjectUtilization(
                project_id=project.id,
                project_code=project.project_code,
                project_name=project.name,
                required_seats=project.required_seats,
                assigned_employees=assigned_employees,
                allocated_seats=allocated_seats,
                utilization_rate=utilization_rate,
                seat_fulfillment_rate=seat_fulfillment_rate,
            )
        )

    return results


@router.get("/floor-utilization", response_model=list[FloorUtilization])
def get_floor_utilization(db: Session = Depends(get_db)):
    floor_stats = (
        db.query(
            Seat.floor,
            Seat.building,
            func.count(Seat.id).label("total_seats"),
            func.sum(case((Seat.employee_id.isnot(None), 1), else_=0)).label("allocated_seats"),
        )
        .group_by(Seat.floor, Seat.building)
        .order_by(Seat.building, Seat.floor)
        .all()
    )

    results: list[FloorUtilization] = []
    for row in floor_stats:
        total = row.total_seats or 0
        allocated = int(row.allocated_seats or 0)
        available = total - allocated
        occupancy_rate = round((allocated / total * 100) if total else 0.0, 2)

        results.append(
            FloorUtilization(
                floor=row.floor,
                building=row.building,
                total_seats=total,
                allocated_seats=allocated,
                available_seats=available,
                occupancy_rate=occupancy_rate,
            )
        )

    return results
