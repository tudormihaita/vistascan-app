from datetime import date
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator
from domain.entities.user import UserRole, Gender


class UserDTO(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    birthdate: date
    gender: Gender
    role: UserRole

class AuthUserRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    user: UserDTO
    access_token: str

class RegisterUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    birthdate: str
    gender: Gender
    role: UserRole

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    birthdate: Optional[str] = None
    gender: Optional[Gender] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

    @field_validator("password")
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

class RegisterResponse(BaseModel):
    user: UserDTO
    access_token: str
