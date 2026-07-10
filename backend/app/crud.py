from __future__ import annotations

from math import ceil

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models import Employee, Project, Seat, SeatStatus
from app.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    ProjectCreate,
    ProjectUpdate,
    SeatCreate,
    SeatUpdate,
)


def paginate(query, page: int, page_size: int):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = ceil(total / page_size) if page_size else 0
    return items, total, pages


# ── Projects ─────────────────────────────────────────────────────────────────


def get_project(db: Session, project_id: int) -> Project | None:
    return db.get(Project, project_id)


def get_project_by_code(db: Session, project_code: str) -> Project | None:
    return db.execute(select(Project).where(Project.project_code == project_code)).scalar_one_or_none()


def get_projects(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    status: str | None = None,
) -> tuple[list[Project], int, int]:
    query = db.query(Project)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(Project.name.ilike(term), Project.project_code.ilike(term)))
    if status:
        query = query.filter(Project.status == status)
    query = query.order_by(Project.priority.desc(), Project.name)
    return paginate(query, page, page_size)


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


# ── Employees ────────────────────────────────────────────────────────────────


def _employee_to_response_dict(employee: Employee) -> dict:
    data = {c.name: getattr(employee, c.name) for c in employee.__table__.columns}
    if employee.allocated_seat:
        data["seat_id"] = employee.allocated_seat.id
        data["seat_code"] = employee.allocated_seat.seat_code
    else:
        data["seat_id"] = None
        data["seat_code"] = None
    return data


def get_employee(db: Session, employee_id: int) -> Employee | None:
    return (
        db.query(Employee)
        .options(joinedload(Employee.allocated_seat), joinedload(Employee.project))
        .filter(Employee.id == employee_id)
        .first()
    )


def get_employee_by_code(db: Session, employee_code: str) -> Employee | None:
    return db.execute(select(Employee).where(Employee.employee_code == employee_code)).scalar_one_or_none()


def get_employees(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    department: str | None = None,
    project_id: int | None = None,
    status: str | None = None,
    unassigned_only: bool = False,
) -> tuple[list[Employee], int, int]:
    query = db.query(Employee).options(joinedload(Employee.allocated_seat), joinedload(Employee.project))

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Employee.name.ilike(term),
                Employee.email.ilike(term),
                Employee.employee_code.ilike(term),
            )
        )
    if department:
        query = query.filter(Employee.department == department)
    if project_id:
        query = query.filter(Employee.project_id == project_id)
    if status:
        query = query.filter(Employee.status == status)
    if unassigned_only:
        query = query.outerjoin(Seat, Seat.employee_id == Employee.id).filter(Seat.id.is_(None))

    query = query.order_by(Employee.name)
    return paginate(query, page, page_size)


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    employee = Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return get_employee(db, employee.id)


def update_employee(db: Session, employee: Employee, data: EmployeeUpdate) -> Employee:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return get_employee(db, employee.id)


def delete_employee(db: Session, employee: Employee) -> None:
    if employee.allocated_seat:
        seat = employee.allocated_seat
        seat.employee_id = None
        seat.status = SeatStatus.AVAILABLE.value
        seat.allocated_at = None
    db.delete(employee)
    db.commit()


# ── Seats ────────────────────────────────────────────────────────────────────


def _seat_to_response_dict(seat: Seat) -> dict:
    data = {c.name: getattr(seat, c.name) for c in seat.__table__.columns}
    data["employee_name"] = seat.employee.name if seat.employee else None
    return data


def get_seat(db: Session, seat_id: int) -> Seat | None:
    return db.query(Seat).options(joinedload(Seat.employee), joinedload(Seat.project)).filter(Seat.id == seat_id).first()


def get_seat_by_code(db: Session, seat_code: str) -> Seat | None:
    return db.execute(select(Seat).where(Seat.seat_code == seat_code)).scalar_one_or_none()


def get_seats(
    db: Session,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    floor: int | None = None,
    zone: str | None = None,
    status: str | None = None,
    project_id: int | None = None,
    available_only: bool = False,
) -> tuple[list[Seat], int, int]:
    query = db.query(Seat).options(joinedload(Seat.employee), joinedload(Seat.project))

    if search:
        term = f"%{search}%"
        query = query.filter(or_(Seat.seat_code.ilike(term), Seat.zone.ilike(term)))
    if floor is not None:
        query = query.filter(Seat.floor == floor)
    if zone:
        query = query.filter(Seat.zone == zone)
    if status:
        query = query.filter(Seat.status == status)
    if project_id:
        query = query.filter(Seat.project_id == project_id)
    if available_only:
        query = query.filter(Seat.status == SeatStatus.AVAILABLE.value, Seat.employee_id.is_(None))

    query = query.order_by(Seat.floor, Seat.seat_code)
    return paginate(query, page, page_size)


def create_seat(db: Session, data: SeatCreate) -> Seat:
    seat = Seat(**data.model_dump())
    db.add(seat)
    db.commit()
    db.refresh(seat)
    return get_seat(db, seat.id)


def update_seat(db: Session, seat: Seat, data: SeatUpdate) -> Seat:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(seat, field, value)
    db.commit()
    db.refresh(seat)
    return get_seat(db, seat.id)


def delete_seat(db: Session, seat: Seat) -> None:
    db.delete(seat)
    db.commit()


def count_employees(db: Session) -> int:
    return db.query(func.count(Employee.id)).scalar() or 0


def count_seats(db: Session) -> int:
    return db.query(func.count(Seat.id)).scalar() or 0


def count_projects(db: Session) -> int:
    return db.query(func.count(Project.id)).scalar() or 0
