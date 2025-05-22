from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from application.dto.user_dto import (
    AuthUserRequest,
    AuthResponse,
    RegisterUserRequest,
    RegisterResponse,
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
    def generate_draft_report(self, consultation_id: UUID, user_id: UUID) -> Optional[ConsultationDTO]:
        """Generate a draft report for a consultation and return the updated consultation details."""
        ...
