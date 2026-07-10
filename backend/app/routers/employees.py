from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
    PaginatedResponse,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=PaginatedResponse[EmployeeResponse])
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department: str | None = None,
    project_id: int | None = None,
    status: str | None = None,
    unassigned_only: bool = False,
    db: Session = Depends(get_db),
):
    items, total, pages = crud.get_employees(
        db,
        page=page,
        page_size=page_size,
        search=search,
        department=department,
        project_id=project_id,
        status=status,
        unassigned_only=unassigned_only,
    )
    return PaginatedResponse(
        items=[EmployeeResponse(**crud._employee_to_response_dict(e)) for e in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return EmployeeResponse(**crud._employee_to_response_dict(employee))


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    if crud.get_employee_by_code(db, data.employee_code):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee code already exists")
    if data.project_id and not crud.get_project(db, data.project_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not found")
    employee = crud.create_employee(db, data)
    return EmployeeResponse(**crud._employee_to_response_dict(employee))


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, data: EmployeeUpdate, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    if data.employee_code and data.employee_code != employee.employee_code:
        existing = crud.get_employee_by_code(db, data.employee_code)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee code already exists")
    if data.project_id and not crud.get_project(db, data.project_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not found")
    employee = crud.update_employee(db, employee, data)
    return EmployeeResponse(**crud._employee_to_response_dict(employee))


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    crud.delete_employee(db, employee)
