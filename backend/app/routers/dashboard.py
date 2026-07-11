from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Employee, EmployeeStatus, Project, ProjectStatus, Seat, SeatStatus
from app.schemas import DashboardSummary, DepartmentCount, FloorUtilization, ProjectUtilization, RecentActivity

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


@router.get("/department-stats", response_model=list[DepartmentCount])
def get_department_stats(db: Session = Depends(get_db)):
    stats = (
        db.query(Employee.department, func.count(Employee.id).label("count"))
        .filter(Employee.department.isnot(None), Employee.department != "")
        .group_by(Employee.department)
        .order_by(func.count(Employee.id).desc())
        .all()
    )
    return [
        DepartmentCount(department=row.department or "Unknown", count=row.count)
        for row in stats
    ]


@router.get("/recent-activity", response_model=list[RecentActivity])
def get_recent_activity(db: Session = Depends(get_db), limit: int = 10):
    activities: list[RecentActivity] = []

    recent_allocations = (
        db.query(Seat)
        .options(joinedload(Seat.employee))
        .filter(Seat.allocated_at.isnot(None))
        .order_by(Seat.allocated_at.desc())
        .limit(limit)
        .all()
    )
    for seat in recent_allocations:
        activities.append(
            RecentActivity(
                action="seat_allocated",
                description=f"Seat {seat.seat_code} allocated to {seat.employee.name if seat.employee else 'Unknown'}",
                timestamp=seat.allocated_at,
            )
        )

    recent_employees = (
        db.query(Employee)
        .order_by(Employee.created_at.desc())
        .limit(limit)
        .all()
    )
    for emp in recent_employees:
        activities.append(
            RecentActivity(
                action="employee_added",
                description=f"Employee {emp.name} ({emp.employee_code}) added",
                timestamp=emp.created_at,
            )
        )

    activities.sort(key=lambda a: a.timestamp, reverse=True)
    return activities[:limit]
