import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from application.interfaces.services import AdminManagementUseCase
from application.interfaces.repositories import UserRepository, ConsultationRepository
from application.interfaces.security import PasswordHasher
from application.dto.user_dto import UserDTO, UpdateUserRequest
from application.dto.consultation_dto import ConsultationDTO, ImagingStudyDTO, ReportDTO
from application.interfaces.storage import FileStorageService
from domain.entities.user import User


class AdminService(AdminManagementUseCase):
    def __init__(
            self,
            user_repository: UserRepository,
            consultation_repository: ConsultationRepository,
            file_storage_service: FileStorageService,
            password_hasher: PasswordHasher
    ):
        self._user_repo = user_repository
        self._consultation_repo = consultation_repository
        self._storage_service = file_storage_service
        self._password_hasher = password_hasher

    def get_all_users(self) -> List[UserDTO]:
        try:
            users = self._user_repo.find_all()
            return [self._user_to_dto(user) for user in users]
        except Exception as e:
            logging.error(f"Error fetching all users: {e}")
            return []

    def get_all_consultations(self) -> List[ConsultationDTO]:
        try:
            consultations = self._consultation_repo.find_all()
            return [self._consultation_to_dto(consultation) for consultation in consultations]
        except Exception as e:
            logging.error(f"Error fetching all consultations: {e}")
            return []

    def update_user(self, user_id: UUID, update_data: UpdateUserRequest) -> Optional[UserDTO]:
        try:
            user = self._user_repo.find_by_id(user_id)
            if not user:
                logging.warning(f"User with ID {user_id} not found.")
                return None

            if update_data.username is not None:
                user.username = update_data.username
            if update_data.email is not None:
                user.email = str(update_data.email)
            if update_data.full_name is not None:
                user.full_name = update_data.full_name
            if update_data.birthdate is not None:
                user.birthdate = datetime.strptime(update_data.birthdate, '%Y-%m-%d').date()
            if update_data.gender is not None:
                user.gender = update_data.gender
            if update_data.role is not None:
                user.role = update_data.role
            if update_data.password is not None:
                user.password = self._password_hasher.hash(update_data.password)

            updated_user = self._user_repo.update(user)
            if updated_user:
                return self._user_to_dto(updated_user)

            return None
        except Exception as e:
            logging.error(f"Error updating user {user_id}: {e}")
            return None

    def delete_user(self, user_id: UUID) -> bool:
        try:
            return self._user_repo.delete_by_id(user_id)
        except Exception as e:
            logging.error(f"Error deleting user {user_id}: {e}")
            return False

    def delete_consultation(self, consultation_id: UUID) -> bool:
        try:
            consultation = self._consultation_repo.find_by_id(consultation_id)
            if not consultation:
                logging.warning(f"Consultation with ID {consultation_id} not found.")
                return False
            deleted = self._consultation_repo.delete_by_id(consultation_id)
            if deleted:
                self._storage_service.delete(consultation.imaging_study.file_path)
                logging.info(f"Consultation with ID {consultation_id} and corresponding imaging study deleted.")
            else:
                logging.warning(f"Failed to delete consultation with ID {consultation_id}, cannot delete imaging study.")

            return deleted
        except Exception as e:
            logging.error(f"Error deleting consultation {consultation_id}: {e}")
            return False


    @staticmethod
    def _user_to_dto(user: User) -> UserDTO:
        return UserDTO(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            birthdate=user.birthdate,
            gender=user.gender,
            role=user.role
        )

    @staticmethod
    def _consultation_to_dto(consultation) -> ConsultationDTO:
        imaging_study_dto = ImagingStudyDTO(
            file_path=consultation.imaging_study.file_path,
            file_name=consultation.imaging_study.file_name,
            content_type=consultation.imaging_study.content_type,
            size=consultation.imaging_study.size,
            upload_date=consultation.imaging_study.upload_date
        )

        report_dto = None
        if consultation.report:
            report_dto = ReportDTO(
                content=consultation.report.content,
                created_at=consultation.report.created_at,
                expert_id=str(consultation.report.expert_id),
                consultation_id=str(consultation.report.consultation_id)
            )

        return ConsultationDTO(
            id=str(consultation.id),
            patient_id=str(consultation.patient_id),
            imaging_study=imaging_study_dto,
            status=consultation.status,
            created_at=consultation.created_at,
            report=report_dto,
            expert_id=str(consultation.expert_id) if consultation.expert_id else None,
            completed_at=consultation.completed_at,
            download_url=consultation.download_url
        )
