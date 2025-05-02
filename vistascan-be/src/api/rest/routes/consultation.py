from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from domain.entities.user import User, UserRole
from application.dto.consultation_dto import (
    CreateConsultationRequest,
    AssignConsultationRequest,
    SubmitReportRequest,
    ConsultationDTO,
)
from application.interfaces.services import ManageConsultationsUseCase
from application.services.consultation_service import ConsultationService

from api.rest.dependencies import (
    get_consultation_service,
    get_current_user,
    get_file_storage_service,
)

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("", response_model=ConsultationDTO, status_code=status.HTTP_201_CREATED)
async def create_consultation(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can create consultations")

    dto = CreateConsultationRequest(
        patient_id=current_user.id,
        file_data=file.file,
        file_name=file.filename,
        content_type=file.content_type or "application/octet-stream",
    )

    result = use_case.create(dto)
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create consultation")

    return result


@router.get("/{consultation_id}", response_model=ConsultationDTO, status_code=status.HTTP_200_OK)
async def get_consultation(
        consultation_id: UUID,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    result = use_case.get_by_id(consultation_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

    if result.patient_id != current_user.id and current_user.role != UserRole.EXPERT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to access this consultation")

    return result


@router.get("", response_model=List[ConsultationDTO], status_code=status.HTTP_200_OK)
async def get_consultations_by_user(
        user_id: UUID,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to access this patient's consultations")

    if current_user.role == UserRole.PATIENT:
        result = use_case.get_by_patient_id(user_id)
    elif current_user.role == UserRole.EXPERT:
        result = use_case.get_by_expert_id(user_id)
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Unauthorized access to consultations")

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No consultations found for this user")

    return result


@router.get("/{consultation_id}/download", status_code=status.HTTP_200_OK)
async def download_study(
        consultation_id: UUID,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    result = use_case.get_by_id(consultation_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

    if (current_user.role != UserRole.ADMIN and
        current_user.id != result.patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to download this file"
        )

    if result.download_url is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Download URL not found"
        )

    return { "download_url": result.download_url }


@router.post("/{consultation_id}/assign", response_model=ConsultationDTO, status_code=status.HTTP_200_OK)
async def assign_consultation(
        consultation_id: UUID,
        request: AssignConsultationRequest,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.EXPERT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to review consultations")

    result = use_case.assign(request)
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to assign consultation")

    return result


@router.post("/{consultation_id}/submit", response_model=ConsultationDTO, status_code=status.HTTP_200_OK)
async def submit_report(
        consultation_id: UUID,
        request: SubmitReportRequest,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.role != UserRole.EXPERT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only experts can submit reports")

    result = use_case.annotate(request)
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to submit report")

    return result