from enum import Enum
from typing import Optional
from dataclasses import dataclass, asdict
from datetime import datetime


class NotificationEventType(str, Enum):
    CONSULTATION_CREATED = "consultation_created"
    CONSULTATION_ASSIGNED = "consultation_assigned"
    CONSULTATION_STATUS_CHANGED = "consultation_status_changed"
    CONSULTATION_COMPLETED = "consultation_completed"
    CONSULTATION_DELETED = "consultation_deleted"


@dataclass
class NotificationEvent:
    event_type: NotificationEventType
    consultation_id: str
    patient_id: str
    expert_id: Optional[str] = None
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    timestamp: Optional[datetime] = None
    message: str = ""

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

    def to_dict(self) -> dict:
        result = asdict(self)

        if isinstance(result['timestamp'], datetime):
            result['timestamp'] = result['timestamp'].isoformat()

        if hasattr(result['event_type'], 'value'):
            result['event_type'] = result['event_type'].value
        elif isinstance(result['event_type'], Enum):
            result['event_type'] = str(result['event_type'].value)

        return result
