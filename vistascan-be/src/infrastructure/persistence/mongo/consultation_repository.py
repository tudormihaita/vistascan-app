import logging
import mongoengine as me
from typing import Optional, List
from uuid import UUID

from application.interfaces.repositories import ConsultationRepository
from domain.entities.consultation import Consultation, ConsultationStatus
from domain.entities.study import ImagingStudy
from domain.entities.report import Report
from infrastructure.persistence.mongo.models import ConsultationDocument, ImagingStudyDocument, ReportDocument


class MongoConsultationRepository(ConsultationRepository):
    def __init__(self, db_name: str, db_uri: str):
        me.connect(db_name, host=db_uri)

    def save(self, consultation: Consultation) -> Optional[Consultation]:
        try:
            consultation_doc = self._entity_to_doc(consultation)
            consultation_doc.save()

            logging.info(f"Saving consultation {consultation.id}")
            return self._doc_to_entity(consultation_doc)
        except Exception as e:
            logging.error(f"Error saving consultation {consultation.id}: {e}")
            return None

    def delete_by_id(self, consultation_id: UUID) -> bool:
        try:
            consultation_doc = ConsultationDocument.objects.get(id=str(consultation_id))
            consultation_doc.delete()
            logging.info(f"Deleted consultation {consultation_id}")
            return True
        except me.DoesNotExist:
            logging.warning(f"Consultation with ID {consultation_id} not found.")
            return False
        except Exception as e:
            logging.error(f"Error deleting consultation {consultation_id}: {e}")
            return False

    def find_by_id(self, consultation_id: UUID) -> Optional[Consultation]:
        try:
            consultation_doc = ConsultationDocument.objects.get(id=str(consultation_id))
            return self._doc_to_entity(consultation_doc)

        except me.DoesNotExist:
            logging.warning(f"Consultation with ID {consultation_id} not found.")
            return None

    def find_by_patient_id(self, patient_id: UUID) -> List[Consultation]:
        try:
            consultations = ConsultationDocument.objects(patient_id=str(patient_id))
            return [self._doc_to_entity(consultation) for consultation in consultations]

        except me.DoesNotExist:
            logging.warning(f"No consultations found for patient ID {patient_id}.")
            return []

    def find_by_status(self, status: ConsultationStatus) -> List[Consultation]:
        try:
            consultations = ConsultationDocument.objects(status=status.value)
            return [self._doc_to_entity(consultation) for consultation in consultations]

        except me.DoesNotExist:
            logging.warning(f"No consultations found with status {status}.")
            return []

    def find_by_expert_id(self, expert_id: UUID) -> List[Consultation]:
        try:
            consultations = ConsultationDocument.objects(expert_id=str(expert_id))
            return [self._doc_to_entity(consultation) for consultation in consultations]

        except me.DoesNotExist:
            logging.warning(f"No consultations found for expert ID {expert_id}.")
            return []

    def find_all(self) -> List[Consultation]:
        try:
            consultations = ConsultationDocument.objects.all()
            return [self._doc_to_entity(consultation) for consultation in consultations]
        except Exception as e:
            logging.error(f"Error fetching all consultations: {e}")
            return []

    @staticmethod
    def _entity_to_doc(consultation: Consultation) -> ConsultationDocument:
        try:
            consultation_doc = ConsultationDocument.objects.get(id=str(consultation.id))
        except me.DoesNotExist:
            consultation_doc = ConsultationDocument(id=str(consultation.id))

        imaging_study_doc = ImagingStudyDocument(
            file_name=consultation.imaging_study.file_name,
            content_type=consultation.imaging_study.content_type,
            size=consultation.imaging_study.size,
            upload_date=consultation.imaging_study.upload_date,
            file_path=consultation.imaging_study.file_path
        )

        report_doc = None
        if consultation.report:
            report_doc = ReportDocument(
                content=consultation.report.content,
                created_at=consultation.report.created_at,
                expert_id=str(consultation.report.expert_id),
                consultation_id=str(consultation.id)
            )

        consultation_doc.patient_id = str(consultation.patient_id)
        consultation_doc.imaging_study = imaging_study_doc
        consultation_doc.status = consultation.status.value
        consultation_doc.created_at = consultation.created_at
        consultation_doc.report = report_doc
        consultation_doc.expert_id = str(consultation.expert_id) if consultation.expert_id else None
        consultation_doc.completed_at = consultation.completed_at
        consultation_doc.download_url = consultation.download_url

        return consultation_doc

    @staticmethod
    def _doc_to_entity(doc: ConsultationDocument) -> Consultation:
        imaging_study = ImagingStudy(
            file_name=doc.imaging_study.file_name,
            content_type=doc.imaging_study.content_type,
            size=doc.imaging_study.size,
            upload_date=doc.imaging_study.upload_date,
            file_path=doc.imaging_study.file_path
        )

        report = None
        if doc.report:
            report = Report(
                content=doc.report.content,
                created_at=doc.report.created_at,
                expert_id=UUID(doc.report.expert_id),
                consultation_id=UUID(doc.report.consultation_id)
            )

        return Consultation(
            id=UUID(doc.id),
            patient_id=UUID(doc.patient_id),
            imaging_study=imaging_study,
            status=ConsultationStatus(doc.status),
            created_at=doc.created_at,
            report=report,
            expert_id=UUID(doc.expert_id) if doc.expert_id else None,
            completed_at=doc.completed_at,
            download_url=doc.download_url
        )
