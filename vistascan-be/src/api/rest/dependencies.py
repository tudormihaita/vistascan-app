from uuid import UUID
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from application.services.admin_service import AdminService
from config import settings
from domain.entities.user import User

from application.interfaces.services import UserAuthenticationUseCase, ManageConsultationsUseCase, \
    AdminManagementUseCase
from application.interfaces.storage import FileStorageService
from application.interfaces.repositories import UserRepository, ConsultationRepository
from application.services.auth_service import AuthService
from application.services.consultation_service import ConsultationService

from infrastructure.persistence.mongo.consultation_repository import MongoConsultationRepository
from infrastructure.storage.minio_storage import MinioStorageService
from infrastructure.security.jwt_token_generator import JWTTokenGenerator
from infrastructure.security.bcrypt_password_hasher import BcryptPasswordHasher
from infrastructure.persistence.mongo.user_repository import MongoUserRepository
from infrastructure.model.model_service import ModelServiceClient
from infrastructure.events.websocket_manager import WebSocketConnectionManager


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

_user_repository: Optional[UserRepository] = None
_consultation_repository: Optional[ConsultationRepository] = None
_auth_service: Optional[UserAuthenticationUseCase] = None
_consultation_service: Optional[ManageConsultationsUseCase] = None
_admin_service: Optional[AdminManagementUseCase] = None
_file_storage_service: Optional[FileStorageService] = None
_model_service_client: Optional[ModelServiceClient] = None
_websocket_manager: Optional[WebSocketConnectionManager] = None

_password_hasher = BcryptPasswordHasher()
_token_generator = JWTTokenGenerator(
    secret_key=settings.jwt_secret,
    expires_in=settings.jwt_expiration,
)

def get_websocket_manager() -> WebSocketConnectionManager:
    global _websocket_manager
    if _websocket_manager is None:
        _websocket_manager = WebSocketConnectionManager()
    return _websocket_manager


def get_user_repository() -> UserRepository:
    global _user_repository
    if _user_repository is None:
        _user_repository = MongoUserRepository(
            db_name=settings.db_name,
            db_uri=settings.db_uri,
        )

    return _user_repository


def get_consultation_repository() -> ConsultationRepository:
    global _consultation_repository
    if _consultation_repository is None:
        _consultation_repository = MongoConsultationRepository(
            db_name=settings.db_name,
            db_uri=settings.db_uri,
        )

    return _consultation_repository


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _user_repo = get_user_repository()

        _auth_service = AuthService(
            user_repository=_user_repo,
            token_generator=_token_generator,
            password_hasher=_password_hasher,
        )

    return _auth_service


def get_file_storage_service() -> FileStorageService:
    global _file_storage_service
    if _file_storage_service is None:
        _file_storage_service = MinioStorageService(
            endpoint=settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            bucket_name=settings.minio_bucket,
            secure=settings.minio_secure
        )

    return _file_storage_service

def get_model_service_client() -> ModelServiceClient:
    global _model_service_client
    if _model_service_client is None:
        model_service_url = settings.model_service_url
        _model_service_client = ModelServiceClient(
            base_url=model_service_url,
            timeout=30
        )

    return _model_service_client


def get_consultation_service() -> ConsultationService:
    global _consultation_service
    if _consultation_service is None:
        _user_repo = get_user_repository()
        _consultation_repo = get_consultation_repository()
        _storage_service = get_file_storage_service()
        _model_client = get_model_service_client()
        _websocket_manager = get_websocket_manager()

        _consultation_service = ConsultationService(
            user_repository=_user_repo,
            consultation_repository=_consultation_repo,
            file_storage_service=_storage_service,
            websocket_manager=_websocket_manager,
            model_client=_model_client,
        )

    return _consultation_service

def get_admin_service() -> AdminService:
    global _admin_service
    if _admin_service is None:
        _user_repo = get_user_repository()
        _consultation_repo = get_consultation_repository()
        websocket_manager = get_websocket_manager()

        _admin_service = AdminService(
            user_repository=_user_repo,
            consultation_repository=_consultation_repo,
            password_hasher=_password_hasher,
            file_storage_service=get_file_storage_service(),
            websocket_manager=websocket_manager,
        )

    return _admin_service

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            key=settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception

        user_repo = get_user_repository()
        user = user_repo.find_by_id(UUID(user_id))
        if user is None:
            raise credentials_exception

        return user

    except JWTError:
        raise credentials_exception