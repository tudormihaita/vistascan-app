from fastapi import APIRouter, Depends, HTTPException, status
from application.interfaces.services import UserAuthenticationUseCase
from application.dto.user_dto import (
    RegisterUserRequest, RegisterResponse,
    AuthUserRequest, AuthResponse,
)
from application.exceptions import (
    UserAlreadyExists,
    InvalidCredentials,
)
from api.rest.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
        dto: RegisterUserRequest,
        auth_service: UserAuthenticationUseCase = Depends(get_auth_service)
) -> RegisterResponse:
    try:
        return auth_service.register(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except UserAlreadyExists as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except InvalidCredentials as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(
        dto: AuthUserRequest,
        auth_service: UserAuthenticationUseCase = Depends(get_auth_service)
) -> AuthResponse:
    try:
        return auth_service.authenticate(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    except InvalidCredentials as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
