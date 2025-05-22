import logging
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from domain.entities.user import UserRole
from domain.entities.study import ImagingStudy
from domain.entities.report import Report
from domain.entities.consultation import Consultation, ConsultationStatus

from application.dto.consultation_dto import CreateConsultationRequest, ConsultationDTO, ImagingStudyDTO, \
    AssignConsultationRequest, ReportDTO, SubmitReportRequest
from application.interfaces.services import ManageConsultationsUseCase
from application.interfaces.repositories import ConsultationRepository, UserRepository
from application.interfaces.storage import FileStorageService
from application.interfaces.model_client import ModelClient

class ConsultationService(ManageConsultationsUseCase):
    def __init__(
            self,
            consultation_repository: ConsultationRepository,
            user_repository: UserRepository,
            file_storage_service: FileStorageService,
            model_client: ModelClient
    ):
        self._repo = consultation_repository
        self._user_repo = user_repository
        self._storage = file_storage_service
        self._model_service = model_client

    def create(self, consultation_dto: CreateConsultationRequest) -> Optional[ConsultationDTO]:
        patient = self._user_repo.find_by_id(consultation_dto.patient_id)
        if not patient:
            logging.error(f"Patient with ID {consultation_dto.patient_id} not found.")
            return None

        try:
            file_object = consultation_dto.get_file_object()

            file_path, file_size = self._storage.upload(
                data=file_object,
                filename=consultation_dto.file_name,
                content_type=consultation_dto.content_type,
                user_id=consultation_dto.patient_id
            )

            logging.info(f"File uploaded successfully: {file_path}")
        except Exception as e:
            logging.error(f"Error uploading file: {e}")
            return None

        now = datetime.now()
        imaging_study = ImagingStudy(
            file_path=file_path,
            file_name=consultation_dto.file_name,
            content_type=consultation_dto.content_type,
            size=file_size,
            upload_date=now,
        )

        consultation = Consultation(
            patient_id=consultation_dto.patient_id,
            imaging_study=imaging_study,
            status=ConsultationStatus.PENDING,
            created_at=now,
        )

        saved_consultation = self._repo.save(consultation)
        if not saved_consultation:
            logging.error("Failed to save consultation.")
            self._storage.delete(consultation_dto.file_name)
            return None

        logging.info(f"Saved consultation successfully: {saved_consultation.id}")

        download_url = self._storage.get_download_url(file_path)
        imaging_study_dto = ImagingStudyDTO(
            file_path=imaging_study.file_path,
            file_name=imaging_study.file_name,
            content_type=imaging_study.content_type,
            size=imaging_study.size,
            upload_date=imaging_study.upload_date,
        )

        return ConsultationDTO(
            id=saved_consultation.id,
            patient_id=consultation_dto.patient_id,
            imaging_study=imaging_study_dto,
            status=saved_consultation.status,
            created_at=saved_consultation.created_at,
            download_url=download_url,
        )

    def assign(self, dto: AssignConsultationRequest) -> Optional[ConsultationDTO]:
        consultation = self._repo.find_by_id(dto.consultation_id)
        if not consultation:
            logging.error(f"Consultation with ID {dto.consultation_id} not found.")
            return None

        expert = self._user_repo.find_by_id(dto.expert_id)
        if not expert:
            logging.error(f"Expert with ID {dto.expert_id} not found.")
            return None

        if expert.role != UserRole.EXPERT and expert.role != UserRole.ADMIN:
            logging.error(f"User with ID {dto.expert_id} is not an expert.")
            return None

        try:
            consultation.assign_to_expert(dto.expert_id)

            updated_consultation = self._repo.save(consultation)
            if not updated_consultation:
                logging.error("Failed to update consultation.")
                return None

            logging.info(f"Consultation assigned successfully: {updated_consultation.id}")

            imaging_study = updated_consultation.imaging_study
            download_url = self._storage.get_download_url(imaging_study.file_path)

            imaging_study_dto = ImagingStudyDTO(
                file_path=imaging_study.file_path,
                file_name=imaging_study.file_name,
                content_type=imaging_study.content_type,
                size=imaging_study.size,
                upload_date=imaging_study.upload_date
            )

            report_dto = None
            if updated_consultation.report:
                report = updated_consultation.report
                report_dto = ReportDTO(
                    content=report.content,
                    created_at=report.created_at,
                    expert_id=report.expert_id,
                    consultation_id=report.consultation_id
                )

            return ConsultationDTO(
                id=updated_consultation.id,
                patient_id=updated_consultation.patient_id,
                imaging_study=imaging_study_dto,
                status=updated_consultation.status,
                created_at=updated_consultation.created_at,
                report=report_dto,
                expert_id=str(updated_consultation.expert_id),
                completed_at=updated_consultation.completed_at,
                download_url=download_url
            )
        except ValueError as e:
            logging.error(f"Error assigning consultation: {e}")
            return None

    def annotate(self, dto: SubmitReportRequest) -> Optional[ConsultationDTO]:
        consultation = self._repo.find_by_id(dto.consultation_id)
        if not consultation:
            logging.error(f"Consultation with ID {dto.consultation_id} not found.")
            return None

        if consultation.expert_id != dto.expert_id:
            logging.error(f"Consultation with ID {dto.consultation_id} is not assigned to expert {dto.expert_id}.")
            return None

        try:
            now = datetime.now()
            report = Report(
                content=dto.content,
                created_at=now,
                expert_id=dto.expert_id,
                consultation_id=dto.consultation_id
            )

            consultation.annotate(report)
            updated_consultation = self._repo.save(consultation)
            if not updated_consultation:
                logging.error("Failed to update consultation.")
                return None

            logging.info(f"Consultation annotated successfully: {updated_consultation.id}")

            imaging_study = updated_consultation.imaging_study
            download_url = self._storage.get_download_url(imaging_study.file_path)
            imaging_study_dto = ImagingStudyDTO(
                file_path=imaging_study.file_path,
                file_name=imaging_study.file_name,
                content_type=imaging_study.content_type,
                size=imaging_study.size,
                upload_date=imaging_study.upload_date
            )

            report_dto = ReportDTO(
                content=report.content,
                created_at=report.created_at,
                expert_id=report.expert_id,
                consultation_id=report.consultation_id
            )

            return ConsultationDTO(
                id=updated_consultation.id,
                patient_id=updated_consultation.patient_id,
                imaging_study=imaging_study_dto,
                status=updated_consultation.status,
                created_at=updated_consultation.created_at,
                report=report_dto,
                expert_id=str(updated_consultation.expert_id),
                completed_at=updated_consultation.completed_at,
                download_url=download_url
            )

        except ValueError as e:
            logging.error(f"Error annotating consultation: {e}")
            return None

    def get_by_id(self, consultation_id: UUID) -> Optional[ConsultationDTO]:
        consultation = self._repo.find_by_id(consultation_id)
        if not consultation:
            logging.error(f"Consultation with ID {consultation_id} not found.")
            return None

        download_url = self._storage.get_download_url(consultation.imaging_study.file_path)
        imaging_study_dto = ImagingStudyDTO(
            file_path=consultation.imaging_study.file_path,
            file_name=consultation.imaging_study.file_name,
            content_type=consultation.imaging_study.content_type,
            size=consultation.imaging_study.size,
            upload_date=consultation.imaging_study.upload_date
        )

        report_dto = None
        if consultation.report:
            report = consultation.report
            report_dto = ReportDTO(
                content=report.content,
                created_at=report.created_at,
                expert_id=report.expert_id,
                consultation_id=report.consultation_id
            )

        return ConsultationDTO(
            id=consultation.id,
            patient_id=consultation.patient_id,
            imaging_study=imaging_study_dto,
            status=consultation.status,
            created_at=consultation.created_at,
            report=report_dto,
            expert_id=str(consultation.expert_id),
            completed_at=consultation.completed_at,
            download_url=download_url
        )

    def get_by_expert_id(self, expert_id: UUID) -> List[ConsultationDTO]:
        consultations = self._repo.find_by_expert_id(expert_id)
        if not consultations:
            logging.error(f"No consultations found for expert ID {expert_id}.")
            return []

        consultation_dtos = []
        for consultation in consultations:
            download_url = self._storage.get_download_url(consultation.imaging_study.file_path)

            imaging_study_dto = ImagingStudyDTO(
                file_path=consultation.imaging_study.file_path,
                file_name=consultation.imaging_study.file_name,
                content_type=consultation.imaging_study.content_type,
                size=consultation.imaging_study.size,
                upload_date=consultation.imaging_study.upload_date
            )

            report_dto = None
            if consultation.report:
                report = consultation.report
                report_dto = ReportDTO(
                    content=report.content,
                    created_at=report.created_at,
                    expert_id=report.expert_id,
                    consultation_id=report.consultation_id
                )

            consultation_dtos.append(ConsultationDTO(
                id=consultation.id,
                patient_id=consultation.patient_id,
                imaging_study=imaging_study_dto,
                status=consultation.status,
                created_at=consultation.created_at,
                report=report_dto,
                expert_id=str(consultation.expert_id),
                completed_at=consultation.completed_at,
                download_url=download_url
            ))

        return consultation_dtos

    def get_by_patient_id(self, patient_id: UUID) -> List[ConsultationDTO]:
        consultations = self._repo.find_by_patient_id(patient_id)
        if not consultations:
            logging.error(f"No consultations found for patient ID {patient_id}.")
            return []

        consultation_dtos = []
        for consultation in consultations:
            download_url = self._storage.get_download_url(consultation.imaging_study.file_path)

            imaging_study_dto = ImagingStudyDTO(
                file_path=consultation.imaging_study.file_path,
                file_name=consultation.imaging_study.file_name,
                content_type=consultation.imaging_study.content_type,
                size=consultation.imaging_study.size,
                upload_date=consultation.imaging_study.upload_date
            )

            report_dto = None
            if consultation.report:
                report = consultation.report
                report_dto = ReportDTO(
                    content=report.content,
                    created_at=report.created_at,
                    expert_id=report.expert_id,
                    consultation_id=report.consultation_id
                )

            consultation_dtos.append(ConsultationDTO(
                id=consultation.id,
                patient_id=consultation.patient_id,
                imaging_study=imaging_study_dto,
                status=consultation.status,
                created_at=consultation.created_at,
                report=report_dto,
                expert_id=str(consultation.expert_id),
                completed_at=consultation.completed_at,
                download_url=download_url
            ))

        return consultation_dtos

    async def generate_draft_report(self, consultation_id: UUID, user_id: UUID) -> Optional[ConsultationDTO]:
        """
        Generate a draft automated report for a consultation using the CLIP-XRGen model.
        """
        consultation = self._repo.find_by_id(consultation_id)
        if not consultation:
            logging.error(f"Consultation with ID {consultation_id} not found.")
            return None

        if consultation.patient_id != user_id:
            logging.error(f"User {user_id} is not authorized to generate report for consultation {consultation_id}")
            return None

        try:
            image_data = self._storage.get(consultation.imaging_study.file_path)
            if not image_data:
                logging.error(f"Failed to retrieve image for consultation {consultation_id}")
                return None

            result = await self._model_service.generate_report(
                image_data=image_data,
                filename=consultation.imaging_study.file_name
            )

            if not result.success:
                logging.error(f"AI report generation failed: {result.message}")
                return None

            now = datetime.now()
            ai_report = Report(
                content=f"AI-Generated Report:\n\n{result.report}\n\n[This report was automatically generated by AI and should be reviewed by a qualified radiologist.]",
                created_at=now,
                expert_id=user_id,
                consultation_id=consultation_id
            )

            consultation.report = ai_report
            consultation.status = ConsultationStatus.COMPLETED
            consultation.completed_at = now

            updated_consultation = self._repo.save(consultation)
            if not updated_consultation:
                logging.error("Failed to save consultation with AI report.")
                return None

            logging.info(f"AI report generated successfully for consultation: {updated_consultation.id}")

            imaging_study = updated_consultation.imaging_study
            download_url = self._storage.get_download_url(imaging_study.file_path)

            imaging_study_dto = ImagingStudyDTO(
                file_path=imaging_study.file_path,
                file_name=imaging_study.file_name,
                content_type=imaging_study.content_type,
                size=imaging_study.size,
                upload_date=imaging_study.upload_date
            )

            report_dto = ReportDTO(
                content=ai_report.content,
                created_at=ai_report.created_at,
                expert_id=ai_report.expert_id,
                consultation_id=ai_report.consultation_id
            )

            return ConsultationDTO(
                id=updated_consultation.id,
                patient_id=updated_consultation.patient_id,
                imaging_study=imaging_study_dto,
                status=updated_consultation.status,
                created_at=updated_consultation.created_at,
                report=report_dto,
                expert_id=str(updated_consultation.expert_id) if updated_consultation.expert_id else None,
                completed_at=updated_consultation.completed_at,
                download_url=download_url
            )

        except Exception as e:
            logging.error(f"Error generating AI report: {e}")
            return None

