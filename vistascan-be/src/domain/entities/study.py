from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4


@dataclass
class ImagingStudy:
    """Entity representing a CXR imaging study uploaded by a patient."""
    file_path: str
    file_name: str
    content_type: str
    size: int
    upload_date: datetime
    patient_id: UUID = field(default_factory=uuid4)

