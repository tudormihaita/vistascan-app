from dataclasses import dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Optional
from uuid import UUID, uuid4

from domain.entities.study import ImagingStudy
from domain.entities.report import Report


class ConsultationStatus(StrEnum):
    PENDING = "PENDING"
    IN_REVIEW = "IN_REVIEW"
    COMPLETED = "COMPLETED"


@dataclass
class Consultation:
    """Entity representing a CXR assessment request by a patient."""
    patient_id: UUID
    imaging_study: ImagingStudy
    status: ConsultationStatus = ConsultationStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    report: Optional[Report] = None
    expert_id: Optional[UUID] = None
    completed_at: Optional[datetime] = None
    download_url: Optional[str] = None
    id: UUID = field(default_factory=uuid4)

    def assign_to_expert(self, expert_id: UUID) -> None:
        """Assign the consultation to a specific expert."""
        self.expert_id = expert_id
        self.status = ConsultationStatus.IN_REVIEW

    def annotate(self, report: Report) -> None:
        """
        Annotate the consultation with a report.
        This marks the consultation as completed.
        """
        self.report = report
        self.status = ConsultationStatus.COMPLETED
        self.completed_at = datetime.now()
