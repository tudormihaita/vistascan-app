import logging
from config import settings
from uuid import UUID
from jose import JWTError, jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends

from domain.entities.user import UserRole
from infrastructure.events.websocket_manager import WebSocketConnectionManager
from api.rest.dependencies import get_websocket_manager, get_user_repository
from application.interfaces.repositories import UserRepository

router = APIRouter()

async def get_user_from_token(token: str, user_repo: UserRepository):
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise JWTError("Invalid token")

        user = user_repo.find_by_id(UUID(user_id))
        if not user:
            raise JWTError("User not found")

        return user
    except JWTError:
        raise JWTError("Could not validate credentials")


@router.websocket("/ws/{token}")
async def websocket_endpoint(
        websocket: WebSocket,
        token: str,
        websocket_manager: WebSocketConnectionManager = Depends(get_websocket_manager),
        user_repo: UserRepository = Depends(get_user_repository)
):
    try:
        user = await get_user_from_token(token, user_repo)

        await websocket_manager.connect(websocket, str(user.id), UserRole(user.role))

        await websocket.send_text(f"Connected to notifications")

        while True:
            data = await websocket.receive_text()

            if data == "ping":
                await websocket.send_text("pong")

    except JWTError as e:
        logging.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
    except WebSocketDisconnect:
        websocket_manager.disconnect(str(user.id))
        logging.info(f"WebSocket disconnected for user {user.id}")
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        websocket_manager.disconnect(str(user.id))
        await websocket.close(code=1011, reason="Internal error")