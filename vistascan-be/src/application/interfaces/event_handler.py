from abc import ABC, abstractmethod


class EventHandler(ABC):
    """Interface for handling application events"""

    @abstractmethod
    def notify_consultation_created(self, consultation_id: str, patient_id: str):
        """Notify when a new consultation is created"""
        ...

    @abstractmethod
    def notify_consultation_assigned(self, consultation_id: str, patient_id: str, expert_id: str):
        """Notify when a consultation is assigned to an expert"""
        ...

    @abstractmethod
    def notify_consultation_status_changed(self, consultation_id: str, patient_id: str,
                                                expert_id: str, old_status: str, new_status: str):
            """Notify when the status of a consultation changes"""
            ...

    @abstractmethod
    def notify_consultation_completed(self, consultation_id: str, patient_id: str, expert_id: str):
        """Notify when a consultation is completed"""
        ...

    @abstractmethod
    def notify_consultation_deleted(self, consultation_id: str, patient_id: str):
        """Notify when a consultation is deleted"""
        ...
