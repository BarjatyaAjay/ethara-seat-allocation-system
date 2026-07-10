from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import (
    AllocationResponse,
    PaginatedResponse,
    SeatAllocateRequest,
    SeatCreate,
    SeatReleaseRequest,
    SeatResponse,
    SeatUpdate,
)
from app.services.allocation_service import AllocationService

router = APIRouter(prefix="/seats", tags=["Seats"])


@router.get("", response_model=PaginatedResponse[SeatResponse])
def list_seats(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    floor: int | None = None,
    zone: str | None = None,
    status: str | None = None,
    project_id: int | None = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    items, total, pages = crud.get_seats(
        db,
        page=page,
        page_size=page_size,
        search=search,
        floor=floor,
        zone=zone,
        status=status,
        project_id=project_id,
        available_only=available_only,
    )
    return PaginatedResponse(
        items=[SeatResponse(**crud._seat_to_response_dict(s)) for s in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{seat_id}", response_model=SeatResponse)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = crud.get_seat(db, seat_id)
    if not seat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat not found")
    return SeatResponse(**crud._seat_to_response_dict(seat))


@router.post("", response_model=SeatResponse, status_code=status.HTTP_201_CREATED)
def create_seat(data: SeatCreate, db: Session = Depends(get_db)):
    if crud.get_seat_by_code(db, data.seat_code):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Seat code already exists")
    if data.project_id and not crud.get_project(db, data.project_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not found")
    seat = crud.create_seat(db, data)
    return SeatResponse(**crud._seat_to_response_dict(seat))


@router.put("/{seat_id}", response_model=SeatResponse)
def update_seat(seat_id: int, data: SeatUpdate, db: Session = Depends(get_db)):
    seat = crud.get_seat(db, seat_id)
    if not seat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat not found")
    if data.seat_code and data.seat_code != seat.seat_code:
        existing = crud.get_seat_by_code(db, data.seat_code)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Seat code already exists")
    if data.project_id and not crud.get_project(db, data.project_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project not found")
    seat = crud.update_seat(db, seat, data)
    return SeatResponse(**crud._seat_to_response_dict(seat))


@router.delete("/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = crud.get_seat(db, seat_id)
    if not seat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat not found")
    if seat.employee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an allocated seat. Release it first.",
        )
    crud.delete_seat(db, seat)


@router.post("/allocate", response_model=AllocationResponse)
def allocate_seat(data: SeatAllocateRequest, db: Session = Depends(get_db)):
    return AllocationService.allocate_seat(db, data.employee_id, data.seat_id)


@router.post("/release", response_model=AllocationResponse)
def release_seat(data: SeatReleaseRequest, db: Session = Depends(get_db)):
    return AllocationService.release_seat(db, seat_id=data.seat_id, employee_id=data.employee_id)


@router.post("/auto-allocate/{employee_id}", response_model=AllocationResponse)
def auto_allocate_seat(
    employee_id: int,
    preferred_floor: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    return AllocationService.auto_allocate(db, employee_id, preferred_floor=preferred_floor)
