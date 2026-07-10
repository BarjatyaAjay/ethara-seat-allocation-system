import random
from datetime import datetime, timezone

from faker import Faker
from sqlalchemy.orm import Session

from app.models import Employee, EmployeeStatus, Project, ProjectStatus, Seat, SeatStatus

fake = Faker()

PROJECTS = [
    {
        "project_code": "PRJ-ALPHA",
        "name": "Project Alpha",
        "description": "Core platform modernization initiative",
        "required_seats": 600,
        "priority": 10,
    },
    {
        "project_code": "PRJ-BETA",
        "name": "Project Beta",
        "description": "Customer experience transformation",
        "required_seats": 550,
        "priority": 9,
    },
    {
        "project_code": "PRJ-GAMMA",
        "name": "Project Gamma",
        "description": "Data analytics and reporting platform",
        "required_seats": 500,
        "priority": 8,
    },
    {
        "project_code": "PRJ-DELTA",
        "name": "Project Delta",
        "description": "Mobile application development",
        "required_seats": 450,
        "priority": 7,
    },
    {
        "project_code": "PRJ-EPSILON",
        "name": "Project Epsilon",
        "description": "Cloud infrastructure migration",
        "required_seats": 400,
        "priority": 6,
    },
    {
        "project_code": "PRJ-ZETA",
        "name": "Project Zeta",
        "description": "Security and compliance enhancement",
        "required_seats": 350,
        "priority": 5,
    },
    {
        "project_code": "PRJ-ETA",
        "name": "Project Eta",
        "description": "AI/ML research and development",
        "required_seats": 300,
        "priority": 4,
    },
    {
        "project_code": "PRJ-THETA",
        "name": "Project Theta",
        "description": "Internal tools and automation",
        "required_seats": 250,
        "priority": 3,
    },
    {
        "project_code": "PRJ-IOTA",
        "name": "Project Iota",
        "description": "Partner integration program",
        "required_seats": 200,
        "priority": 2,
    },
    {
        "project_code": "PRJ-KAPPA",
        "name": "Project Kappa",
        "description": "Legacy system decommission",
        "required_seats": 150,
        "priority": 1,
    },
]

DEPARTMENTS = ["Engineering", "Product", "Design", "QA", "DevOps", "Data Science", "Support", "HR", "Finance"]
TEAMS = ["Platform", "Frontend", "Backend", "Mobile", "Infra", "Analytics", "UX", "Automation"]
ROLES = ["Developer", "Senior Developer", "Lead", "Manager", "Analyst", "Engineer", "Architect", "Consultant"]
ZONES = ["A", "B", "C", "D", "E"]
BUILDINGS = ["Main Building", "Tower A", "Tower B"]
SEAT_TYPES = ["standard", "hot-desk", "executive", "collaborative"]
FLOORS = list(range(1, 11))


def is_database_seeded(db: Session) -> bool:
    return db.query(Employee).count() > 0


def seed_database(db: Session) -> dict:
    if is_database_seeded(db):
        return {
            "seeded": False,
            "message": "Database already contains data. Skipping seed.",
            "employees": db.query(Employee).count(),
            "projects": db.query(Project).count(),
            "seats": db.query(Seat).count(),
        }

    random.seed(42)
    Faker.seed(42)

    project_records = [
        {**project, "status": ProjectStatus.ACTIVE.value}
        for project in PROJECTS
    ]
    db.bulk_insert_mappings(Project, project_records)
    db.flush()

    projects = db.query(Project).order_by(Project.id).all()
    project_ids = [p.id for p in projects]

    seat_mappings = []
    for index in range(1, 5501):
        floor = FLOORS[(index - 1) % len(FLOORS)]
        zone = ZONES[(index - 1) % len(ZONES)]
        building = BUILDINGS[(index - 1) % len(BUILDINGS)]
        seat_mappings.append(
            {
                "seat_code": f"S-{floor:02d}{zone}-{index:04d}",
                "building": building,
                "floor": floor,
                "zone": f"Zone {zone}",
                "seat_type": random.choice(SEAT_TYPES),
                "status": SeatStatus.AVAILABLE.value,
                "project_id": random.choice(project_ids),
            }
        )
    db.bulk_insert_mappings(Seat, seat_mappings)
    db.flush()

    employee_mappings = []
    used_emails: set[str] = set()
    for index in range(1, 5001):
        first = fake.first_name()
        last = fake.last_name()
        email = f"{first.lower()}.{last.lower()}{index}@ethara.com"
        while email in used_emails:
            email = f"{first.lower()}.{last.lower()}{index}{random.randint(1, 9999)}@ethara.com"
        used_emails.add(email)

        employee_mappings.append(
            {
                "employee_code": f"EMP-{index:05d}",
                "name": f"{first} {last}",
                "email": email,
                "department": random.choice(DEPARTMENTS),
                "team": random.choice(TEAMS),
                "role": random.choice(ROLES),
                "project_id": random.choice(project_ids),
                "status": EmployeeStatus.ACTIVE.value,
            }
        )
    db.bulk_insert_mappings(Employee, employee_mappings)
    db.flush()

    employees = db.query(Employee.id).order_by(Employee.id).all()
    available_seats = (
        db.query(Seat)
        .filter(Seat.status == SeatStatus.AVAILABLE.value, Seat.employee_id.is_(None))
        .order_by(Seat.id)
        .limit(4200)
        .all()
    )

    now = datetime.now(timezone.utc)
    for employee_row, seat in zip(employees[:4200], available_seats):
        seat.employee_id = employee_row.id
        seat.status = SeatStatus.ALLOCATED.value
        seat.allocated_at = now

    db.commit()

    return {
        "seeded": True,
        "message": "Sample data seeded successfully.",
        "employees": db.query(Employee).count(),
        "projects": db.query(Project).count(),
        "seats": db.query(Seat).count(),
        "allocated_seats": db.query(Seat).filter(Seat.employee_id.isnot(None)).count(),
    }
