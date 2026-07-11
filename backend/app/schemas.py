from datetime import datetime
from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    pages: int


# ── Project ──────────────────────────────────────────────────────────────────


class ProjectBase(BaseModel):
    project_code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    required_seats: int = Field(default=0, ge=0)
    priority: int = Field(default=1, ge=1, le=10)
    status: str = Field(default="active")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    required_seats: Optional[int] = Field(default=None, ge=0)
    priority: Optional[int] = Field(default=None, ge=1, le=10)
    status: Optional[str] = None


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ── Employee ─────────────────────────────────────────────────────────────────


class EmployeeBase(BaseModel):
    employee_code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    department: Optional[str] = None
    team: Optional[str] = None
    role: Optional[str] = None
    project_id: Optional[int] = None
    status: str = Field(default="active")


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    employee_code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    team: Optional[str] = None
    role: Optional[str] = None
    project_id: Optional[int] = None
    status: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    seat_id: Optional[int] = None
    seat_code: Optional[str] = None


# ── Seat ─────────────────────────────────────────────────────────────────────


class SeatBase(BaseModel):
    seat_code: str = Field(..., min_length=1, max_length=50)
    building: str = Field(default="Main Building", max_length=100)
    floor: int = Field(..., ge=0)
    zone: Optional[str] = None
    seat_type: str = Field(default="standard", max_length=50)
    status: str = Field(default="available")
    project_id: Optional[int] = None


class SeatCreate(SeatBase):
    pass


class SeatUpdate(BaseModel):
    seat_code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    building: Optional[str] = Field(default=None, max_length=100)
    floor: Optional[int] = Field(default=None, ge=0)
    zone: Optional[str] = None
    seat_type: Optional[str] = Field(default=None, max_length=50)
    status: Optional[str] = None
    project_id: Optional[int] = None


class SeatResponse(SeatBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: Optional[int] = None
    employee_name: Optional[str] = None
    allocated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ── Allocation ───────────────────────────────────────────────────────────────


class SeatAllocateRequest(BaseModel):
    employee_id: int = Field(..., gt=0)
    seat_id: int = Field(..., gt=0)


class SeatReleaseRequest(BaseModel):
    seat_id: Optional[int] = Field(default=None, gt=0)
    employee_id: Optional[int] = Field(default=None, gt=0)


class AllocationResponse(BaseModel):
    success: bool
    message: str
    seat: Optional[SeatResponse] = None
    employee: Optional[EmployeeResponse] = None


# ── Dashboard ────────────────────────────────────────────────────────────────


class DashboardSummary(BaseModel):
    total_employees: int
    active_employees: int
    unassigned_employees: int
    total_seats: int
    allocated_seats: int
    available_seats: int
    maintenance_seats: int
    total_projects: int
    active_projects: int
    occupancy_rate: float


class ProjectUtilization(BaseModel):
    project_id: int
    project_code: str
    project_name: str
    required_seats: int
    assigned_employees: int
    allocated_seats: int
    utilization_rate: float
    seat_fulfillment_rate: float


class FloorUtilization(BaseModel):
    floor: int
    building: str
    total_seats: int
    allocated_seats: int
    available_seats: int
    occupancy_rate: float


class DepartmentCount(BaseModel):
    department: str
    count: int


class RecentActivity(BaseModel):
    action: str
    description: str
    timestamp: datetime


# ── AI Assistant ─────────────────────────────────────────────────────────────


class AIQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)


class AIQueryResponse(BaseModel):
    query: str
    intent: str
    confidence: float
    filters: Dict[str, Any]
    explanation: str
    results: List[Dict[str, Any]]
    result_count: int
