from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from domain.entities.user import User, UserRole
from application.dto.user_dto import UserDTO, UpdateUserRequest
from application.dto.consultation_dto import ConsultationDTO
from application.interfaces.services import AdminManagementUseCase

from api.rest.dependencies import get_current_user, get_admin_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=List[UserDTO], status_code=status.HTTP_200_OK)
async def get_all_users(
        current_user: User = Depends(get_current_user),
        admin_service: AdminManagementUseCase = Depends(get_admin_service)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )

    users = admin_service.get_all_users()
    return users


@router.get("/consultations", response_model=List[ConsultationDTO], status_code=status.HTTP_200_OK)
async def get_all_consultations(
        current_user: User = Depends(get_current_user),
        admin_service: AdminManagementUseCase = Depends(get_admin_service)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this endpoint"
        )

    consultations = admin_service.get_all_consultations()
    return consultations


@router.put("/users/{user_id}", response_model=UserDTO, status_code=status.HTTP_200_OK)
async def update_user(
        user_id: UUID,
        update_data: UpdateUserRequest,
        current_user: User = Depends(get_current_user),
        admin_service: AdminManagementUseCase = Depends(get_admin_service)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update users"
        )

    updated_user = admin_service.update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or update failed"
        )

    return updated_user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
        user_id: UUID,
        current_user: User = Depends(get_current_user),
        admin_service: AdminManagementUseCase = Depends(get_admin_service)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    success = admin_service.delete_user(user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or deletion failed"
        )

@router.delete("/consultations/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consultation(
        consultation_id: UUID,
        current_user: User = Depends(get_current_user),
        admin_service: AdminManagementUseCase = Depends(get_admin_service)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete consultations"
        )

    success = await admin_service.delete_consultation(consultation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consultation not found or deletion failed"
        )