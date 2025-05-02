from abc import ABC, abstractmethod
from typing import Optional, List
from uuid import UUID

from domain.entities.user import User
from domain.entities.consultation import Consultation, ConsultationStatus

class UserRepository(ABC):
    """Repository interface for CRUD operations on User entities."""
    @abstractmethod
    def save(self, user: User) -> Optional[User]:
        """Persist a User (new or updated)."""
        ...

    @abstractmethod
    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find a User by its ID."""
        ...

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]:
        """Find a User by its email."""
        ...

    @abstractmethod
    def find_by_username(self, username: str) -> Optional[User]:
        """Find a User by its username."""
        ...


class ConsultationRepository(ABC):
    """Repository interface for CRUD operations on Consultation entities."""
    @abstractmethod
    def save(self, consultation: Consultation) -> Optional[Consultation]:
        """Persist a Consultation (new or updated)."""
        ...

    @abstractmethod
    def find_by_id(self, consultation_id: UUID) -> Optional[Consultation]:
        """Find a consultation by its ID."""
        ...

    @abstractmethod
    def find_by_patient_id(self, patient_id: UUID) -> List[Consultation]:
        """Find  all consultations associated to a patient."""
        ...

    @abstractmethod
    def find_by_expert_id(self, expert_id: UUID) -> List[Consultation]:
        """Find all consultations assigned to an expert."""
        ...

    @abstractmethod
    def find_by_status(self, status: ConsultationStatus) -> List[Consultation]:
        """Find all consultations with a specific status."""
        ...
