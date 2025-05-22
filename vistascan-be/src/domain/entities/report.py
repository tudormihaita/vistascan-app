from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Report:
    """Entity representing a radiology report associated with an imaging study."""
    content: str
    created_at: datetime
    expert_id: UUID
    consultation_id: UUID

@dataclass
class ReportGenerationResult:
    """Entity representing the result of a report generation process."""
    report: str
    success: bool
    message: str = ""