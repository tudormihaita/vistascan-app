from datetime import datetime
from typing import Optional, BinaryIO
from pydantic import BaseModel
from uuid import UUID
import io

from domain.entities.consultation import ConsultationStatus


class ImagingStudyDTO(BaseModel):
    file_name: str
    content_type: str
    size: int
    upload_date: datetime
    file_path: Optional[str] = None


class ReportDTO(BaseModel):
    content: str
    created_at: datetime
    expert_id: UUID
    consultation_id: UUID


class CreateConsultationRequest(BaseModel):
    patient_id: UUID
    file_data: bytes
    file_name: str
    content_type: str

    def get_file_object(self) -> BinaryIO:
        return io.BytesIO(self.file_data)


class AssignConsultationRequest(BaseModel):
    consultation_id: UUID
    expert_id: UUID


class SubmitReportRequest(BaseModel):
    consultation_id: UUID
    content: str
    expert_id: UUID


class ConsultationDTO(BaseModel):
    id: Optional[UUID] = None
    patient_id: UUID
    imaging_study: ImagingStudyDTO
    status: ConsultationStatus
    created_at: datetime
    report: Optional[ReportDTO] = None
    expert_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    download_url: Optional[str] = None
