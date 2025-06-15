from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from uuid import UUID

from application.dto.user_dto import (
    AuthUserRequest,
    AuthResponse,
    RegisterUserRequest,
    RegisterResponse, UserDTO, UpdateUserRequest,
)
from application.dto.consultation_dto import (
    CreateConsultationRequest,
    AssignConsultationRequest,
    SubmitReportRequest,
    ConsultationDTO
)

class UserAuthenticationUseCase(ABC):
    """Interface for user authentication and registration operations."""
    @abstractmethod
    def authenticate(self, auth_user: AuthUserRequest) -> AuthResponse:
        """Authenticate a user and return an access token."""
        ...

    @abstractmethod
    def register(self, register_user: RegisterUserRequest) -> RegisterResponse:
        """Register a new user and return the user details and access token."""
        ...


class ManageConsultationsUseCase(ABC):
    """Interface for managing consultations operations."""
    @abstractmethod
    def create(self, consultation_dto: CreateConsultationRequest) -> Optional[ConsultationDTO]:
        """Create a new consultation and return its details."""
        ...

    @abstractmethod
    def assign(self, dto: AssignConsultationRequest) -> Optional[ConsultationDTO]:
        """Assign a consultation to an expert and return the updated consultation details."""
        ...

    @abstractmethod
    def annotate(self, dto: SubmitReportRequest) -> Optional[ConsultationDTO]:
        """Submit a report for a consultation and return the updated consultation details."""
        ...

    @abstractmethod
    def get_by_status(self, status: str) -> List[ConsultationDTO]:
        """Retrieve consultations by their status."""
        ...

    @abstractmethod
    def get_by_id(self, consultation_id: UUID) -> Optional[ConsultationDTO]:
        """Retrieve a consultation by its ID."""
        ...

    @abstractmethod
    def get_by_patient_id(self, patient_id: UUID) -> List[ConsultationDTO]:
        """Retrieve all consultations associated with a patient."""
        ...

    @abstractmethod
    def get_by_expert_id(self, expert_id: UUID) -> List[ConsultationDTO]:
        """Retrieve all consultations assigned to an expert."""
        ...

    @abstractmethod
    def generate_draft_report(self, consultation_id: UUID, user_id: UUID) -> Dict[str, Any]:
        """Generate a draft report for a consultation and return the report content."""
        ...

class AdminManagementUseCase(ABC):
    """Interface for admin management operations."""

    @abstractmethod
    def get_all_users(self) -> List[UserDTO]:
        """Retrieve all users in the system."""
        ...

    @abstractmethod
    def get_all_consultations(self) -> List[ConsultationDTO]:
        """Get all consultations in the system."""
        ...

    @abstractmethod
    def update_user(self, user_id: UUID, update_data: UpdateUserRequest) -> Optional[UserDTO]:
        """Update a user's information."""
        ...

    @abstractmethod
    def delete_user(self, user_id: UUID) -> bool:
        """Delete a user from the system."""
        ...

    @abstractmethod
    def delete_consultation(self, consultation_id: UUID) -> bool:
        """Delete a consultation from the system."""
        ...
