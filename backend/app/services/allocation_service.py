from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import crud
from app.models import Employee, EmployeeStatus, Seat, SeatStatus
from app.schemas import AllocationResponse, EmployeeResponse, SeatResponse


class AllocationService:
    @staticmethod
    def allocate_seat(db: Session, employee_id: int, seat_id: int) -> AllocationResponse:
        employee = crud.get_employee(db, employee_id)
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        if employee.status != EmployeeStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee '{employee.name}' is not active",
            )

        seat = crud.get_seat(db, seat_id)
        if not seat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat not found")

        if seat.status == SeatStatus.MAINTENANCE.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Seat '{seat.seat_code}' is under maintenance",
            )

        if seat.employee_id is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat '{seat.seat_code}' is already allocated",
            )

        if employee.allocated_seat:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee '{employee.name}' already has seat '{employee.allocated_seat.seat_code}'",
            )

        seat.employee_id = employee.id
        seat.status = SeatStatus.ALLOCATED.value
        seat.allocated_at = datetime.now(timezone.utc)
        db.commit()

        seat = crud.get_seat(db, seat.id)
        employee = crud.get_employee(db, employee.id)

        return AllocationResponse(
            success=True,
            message=f"Seat '{seat.seat_code}' allocated to '{employee.name}'",
            seat=SeatResponse(**crud._seat_to_response_dict(seat)),
            employee=EmployeeResponse(**crud._employee_to_response_dict(employee)),
        )

    @staticmethod
    def release_seat(
        db: Session,
        *,
        seat_id: int | None = None,
        employee_id: int | None = None,
    ) -> AllocationResponse:
        if not seat_id and not employee_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either seat_id or employee_id must be provided",
            )

        seat: Seat | None = None
        employee: Employee | None = None

        if seat_id:
            seat = crud.get_seat(db, seat_id)
            if not seat:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat not found")
            if seat.employee_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Seat '{seat.seat_code}' is not allocated",
                )
            employee = crud.get_employee(db, seat.employee_id)
        else:
            employee = crud.get_employee(db, employee_id)
            if not employee:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
            if not employee.allocated_seat:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Employee '{employee.name}' has no allocated seat",
                )
            seat = employee.allocated_seat

        seat_code = seat.seat_code
        employee_name = employee.name if employee else "Unknown"

        seat.employee_id = None
        seat.status = SeatStatus.AVAILABLE.value
        seat.allocated_at = None
        db.commit()

        seat = crud.get_seat(db, seat.id)

        return AllocationResponse(
            success=True,
            message=f"Seat '{seat_code}' released from '{employee_name}'",
            seat=SeatResponse(**crud._seat_to_response_dict(seat)),
            employee=EmployeeResponse(**crud._employee_to_response_dict(employee)) if employee else None,
        )

    @staticmethod
    def auto_allocate(db: Session, employee_id: int, *, preferred_floor: int | None = None) -> AllocationResponse:
        employee = crud.get_employee(db, employee_id)
        if not employee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        if employee.allocated_seat:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee already has seat '{employee.allocated_seat.seat_code}'",
            )

        query = (
            db.query(Seat)
            .filter(
                Seat.employee_id.is_(None),
                Seat.status == SeatStatus.AVAILABLE.value,
            )
            .order_by(Seat.floor, Seat.seat_code)
        )

        if preferred_floor is not None:
            seat = query.filter(Seat.floor == preferred_floor).first()
            if not seat:
                seat = query.first()
        elif employee.project_id:
            seat = (
                query.filter(Seat.project_id == employee.project_id).first()
                or query.first()
            )
        else:
            seat = query.first()

        if not seat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available seats found",
            )

        return AllocationService.allocate_seat(db, employee_id, seat.id)
