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

export interface ConsultationDto {
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

export interface AssignConsultationRequestDto {
    consultation_id: string;
    expert_id: string;
}

export interface SubmitReportRequestDto {
    consultation_id: string;
    content: string;
    expert_id: string;
}