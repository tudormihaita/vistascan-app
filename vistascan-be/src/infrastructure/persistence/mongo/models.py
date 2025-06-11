import mongoengine as me

from domain.entities.user import Gender, UserRole
from domain.entities.consultation import ConsultationStatus


class UserDocument(me.Document):
    """MongoDB document model for User."""
    id = me.StringField(primary_key=True)
    username = me.StringField(required=True, unique=True)
    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    full_name = me.StringField(required=True)
    birthdate = me.DateField(required=True)
    gender = me.StringField(required=True, choices=[g.value for g in Gender])
    role = me.StringField(required=True, choices=[r.value for r in UserRole])

    meta = {
        'collection': 'users',
        'indexes': [
            'username',
            'email',
        ]
    }


class ImagingStudyDocument(me.EmbeddedDocument):
    file_path = me.StringField(required=True)
    file_name = me.StringField(required=True)
    content_type = me.StringField(required=True)
    size = me.IntField(required=True)
    upload_date = me.DateTimeField(required=True)


class ReportDocument(me.EmbeddedDocument):
    content = me.StringField(required=True)
    created_at = me.DateTimeField(required=True)
    expert_id = me.StringField(required=True)
    consultation_id = me.StringField(required=True)


class ConsultationDocument(me.Document):
    """MongoDB document model for Consultation."""
    id = me.StringField(primary_key=True)
    patient_id = me.StringField(required=True)
    imaging_study = me.EmbeddedDocumentField(ImagingStudyDocument)
    status = me.StringField(required=True, choices=[s.value for s in ConsultationStatus])
    created_at = me.DateTimeField(required=True)
    report = me.EmbeddedDocumentField(ReportDocument)
    expert_id = me.StringField()
    completed_at = me.DateTimeField()
    download_url = me.StringField()

    meta = {
        'collection': 'consultations',
        'indexes': [
            'patient_id',
            'expert_id',
            'status',
        ]
    }
