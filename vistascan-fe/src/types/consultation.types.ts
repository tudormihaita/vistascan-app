export enum ConsultationStatus {
    PENDING = 'PENDING',
    IN_REVIEW = 'IN_REVIEW',
    COMPLETED = 'COMPLETED',
}

export interface ImagingStudy {
    file_name: string;
    content_type: string;
    size: number;
    upload_date: string;
    file_path?: string;
}

export interface Report {
    content: string;
    created_at: string;
    expert_id: string;
    consultation_id: string;
}

export interface Consultation {
    id?: string;
    patient_id: string;
    imaging_study: ImagingStudy;
    status: ConsultationStatus;
    created_at: string;
    report: Report;
    expert_id?: string;
    completed_at?: string;
    download_url?: string;
}

export interface ConsultationState {
    consultations: Consultation[];
    currentConsultation: Consultation | null;
    isLoading: boolean;
    error: string | null;
}

export interface CreateConsultationRequest {
    patient_id: string;
    file_data: File;
    file_name: string;
    content_type: string;
}

export interface AssignConsultationRequest {
    consultation_id: string;
    expert_id: string;
}

export interface SubmitReportRequest {
    consultation_id: string;
    content: string;
    expert_id: string;
}