import json
import logging
from typing import Dict, List
from fastapi import WebSocket

from domain.entities.user import UserRole
from domain.entities.event import NotificationEvent, NotificationEventType
from application.interfaces.event_handler import EventHandler


class WebSocketConnectionManager(EventHandler):
    def __init__(self):
        self._active_connections: Dict[str, WebSocket] = {}
        self._user_roles: Dict[str, UserRole] = {}

    async def connect(self, websocket: WebSocket, user_id: str, user_role: UserRole):
        await websocket.accept()
        self._active_connections[user_id] = websocket
        self._user_roles[user_id] = user_role
        logging.info(f"WebSocket connection established for user {user_id} with role {user_role.value}")

    def disconnect(self, user_id: str):
        if user_id in self._active_connections:
            del self._active_connections[user_id]
        if user_id in self._user_roles:
            del self._user_roles[user_id]
        logging.info(f"WebSocket connection closed for user {user_id}")

    async def send_message(self, message: str, user_id: str):
        if user_id in self._active_connections:
            try:
                await self._active_connections[user_id].send_text(message)
            except Exception as e:
                logging.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)

    async def broadcast_to_roles(self, message: str, target_roles: List[UserRole]):
        for user_id, user_role in self._user_roles.items():
            if user_role in target_roles:
                await self.send_message(message, user_id)

    async def broadcast_to_all(self, message: str):
        disconnected_users = []
        for user_id, websocket in self._active_connections.items():
            try:
                await websocket.send_text(message)
            except Exception as e:
                logging.error(f"Error sending message to user {user_id}: {e}")
                disconnected_users.append(user_id)

        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def notify_consultation_created(self, consultation_id: str, patient_id: str):
        event = NotificationEvent(
            event_type=NotificationEventType.CONSULTATION_CREATED,
            consultation_id=consultation_id,
            patient_id=patient_id,
            message=f"New consultation submitted and ready for review"
        )

        await self.broadcast_to_roles(json.dumps(event.to_dict()),[UserRole.EXPERT, UserRole.ADMIN])

    async def notify_consultation_assigned(self, consultation_id: str, patient_id: str, expert_id: str):
        event = NotificationEvent(
            event_type=NotificationEventType.CONSULTATION_ASSIGNED,
            consultation_id=consultation_id,
            patient_id=patient_id,
            expert_id=expert_id,
            old_status="PENDING",
            new_status="IN_REVIEW",
            message=f"Consultation has been assigned to an expert for review"
        )

        await self.broadcast_to_roles(json.dumps(event.to_dict()),[UserRole.EXPERT, UserRole.ADMIN])
        await self.send_message(json.dumps(event.to_dict()), patient_id)

    async def notify_consultation_status_changed(self, consultation_id: str, patient_id: str,
                                                 expert_id: str, old_status: str, new_status: str):
        event = NotificationEvent(
            event_type=NotificationEventType.CONSULTATION_STATUS_CHANGED,
            consultation_id=consultation_id,
            patient_id=patient_id,
            expert_id=expert_id,
            old_status=old_status,
            new_status=new_status,
            message=f"Consultation status updated to {new_status}"
        )

        if new_status == "COMPLETED":
            await self.notify_consultation_completed(consultation_id, patient_id, expert_id)
        else:
            await self.broadcast_to_all(json.dumps(event.to_dict()))

    async def notify_consultation_completed(self, consultation_id: str, patient_id: str, expert_id: str):
        event = NotificationEvent(
            event_type=NotificationEventType.CONSULTATION_COMPLETED,
            consultation_id=consultation_id,
            patient_id=patient_id,
            expert_id=expert_id,
            old_status="IN_REVIEW",
            new_status="COMPLETED",
            message="Consultation has been completed - report is now available"
        )

        await self.broadcast_to_all(json.dumps(event.to_dict()))

    async def notify_consultation_deleted(self, consultation_id: str, patient_id: str):
        event = NotificationEvent(
            event_type=NotificationEventType.CONSULTATION_DELETED,
            consultation_id=consultation_id,
            patient_id=patient_id,
            expert_id='',
            message="Consultation has been deleted by administrator"
        )

        await self.broadcast_to_all(json.dumps(event.to_dict()))