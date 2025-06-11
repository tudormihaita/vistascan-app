from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, Query

from domain.entities.consultation import ConsultationStatus
from domain.entities.user import User, UserRole
from application.dto.consultation_dto import (
    CreateConsultationRequest,
    AssignConsultationRequest,
    SubmitReportRequest,
    ConsultationDTO,
)
from application.interfaces.services import ManageConsultationsUseCase

from api.rest.dependencies import (
    get_consultation_service,
    get_current_user,
)

router = APIRouter(prefix="/consultations", tags=["consultations"])


@router.post("", response_model=ConsultationDTO, status_code=status.HTTP_201_CREATED)
async def create_consultation(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.role != UserRole.PATIENT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can create consultations")

    file_content = await file.read()
    dto = CreateConsultationRequest(
        patient_id=current_user.id,
        file_data=file_content,
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

    if result.patient_id != current_user.id and current_user.role != UserRole.EXPERT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="You do not have permission to access this consultation")

    return result

@router.get("", response_model=List[ConsultationDTO], status_code=status.HTTP_200_OK)
async def get_filtered_consultations(
        user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
        consultation_status: Optional[str] = Query(None, description="Filter by consultation status", alias="status"),
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if not user_id and not consultation_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one filter (user_id or status) must be provided"
        )

    if consultation_status:
        try:
            consultation_status = ConsultationStatus(consultation_status.upper())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {consultation_status}. Valid statuses are: PENDING, IN_REVIEW, COMPLETED"
            )

    if consultation_status and not user_id:
        if current_user.role not in [UserRole.EXPERT, UserRole.ADMIN]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only experts and admins can filter consultations by status"
            )

    if user_id and current_user.role != UserRole.ADMIN:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this user's consultations"
            )

    result = []
    if user_id:
        if current_user.role == UserRole.ADMIN:
            result += use_case.get_by_patient_id(user_id) or []
            result += use_case.get_by_expert_id(user_id) or []
        elif current_user.role == UserRole.PATIENT:
            result = use_case.get_by_patient_id(user_id) or []
        elif current_user.role == UserRole.EXPERT:
            result = use_case.get_by_expert_id(user_id) or []

    if consultation_status:
        if not result:
            result = use_case.get_by_status(consultation_status)
        else:
            result = [c for c in result if c.status == consultation_status]

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

    if (current_user.role not in [UserRole.ADMIN, UserRole.EXPERT] and
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

    return {"download_url": result.download_url}


@router.post("/{consultation_id}/assign", response_model=ConsultationDTO, status_code=status.HTTP_200_OK)
async def assign_consultation(
        consultation_id: UUID,
        request: AssignConsultationRequest,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    if current_user.role != UserRole.ADMIN and current_user.role != UserRole.EXPERT and current_user.role != UserRole.ADMIN:
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
    if current_user.role != UserRole.EXPERT and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only experts can submit reports")

    result = use_case.annotate(request)
    if not result:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to submit report")

    return result


@router.post("/{consultation_id}/generate-report", response_model=ConsultationDTO, status_code=status.HTTP_200_OK)
async def generate_ai_report(
        consultation_id: UUID,
        current_user: User = Depends(get_current_user),
        use_case: ManageConsultationsUseCase = Depends(get_consultation_service)
):
    """
    Generate an AI report for a consultation
    """
    if current_user.role not in [UserRole.EXPERT, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only experts and admins can generate AI reports")

    try:
        result = await use_case.generate_draft_report(consultation_id, current_user.id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate AI report"
            )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI report: {str(e)}"
        )
