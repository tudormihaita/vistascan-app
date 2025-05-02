from enum import StrEnum
from typing import Optional
from uuid import UUID, uuid4
from datetime import date
from dataclasses import dataclass, field


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    PATIENT = "PATIENT"
    EXPERT = "EXPERT"

class Gender(StrEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"

@dataclass
class User:
    """
    User entity representing the core business rules for the remote consultation app user.
    This is a domain entity and should not depend on any external framework or technology.
    """
    username: str
    email: str
    password: str
    full_name: str
    birthdate: date
    gender: Gender
    role: UserRole
    id: Optional[UUID] = field(default_factory=uuid4)

    def is_expert(self):
        return self.role == UserRole.EXPERT