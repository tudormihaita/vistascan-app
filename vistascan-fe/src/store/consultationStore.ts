import {create} from 'zustand';
import {
    Consultation,
    ConsultationState,
    AssignConsultationRequest,
    SubmitReportRequest
} from '../types/consultation.types';
import axiosInstance from '../utils/axios';
import {ConsultationApi} from "../api/consultation.api.ts";

interface ConsultationStore extends ConsultationState {
    fetchConsultationsByUserId: (userId: string) => Promise<void>;
    fetchConsultationById: (consultationId: string) => Promise<void>;
    createConsultation: (file: File) => Promise<Consultation | null>;
    assignConsultation: (request: AssignConsultationRequest) => Promise<void>;
    submitReport: (request: SubmitReportRequest) => Promise<void>;
    generateDraftReport: (consultationId: string) => Promise<Consultation | null>;
    clearError: () => void;
    resetCurrentConsultation: () => void;
}

export const useConsultationStore = create<ConsultationStore>((set, get) => ({
    consultations: [],
    currentConsultation: null,
    isLoading: false,
    error: null,

    fetchConsultationsByUserId: async (userId: string) => {
        try {
            set({isLoading: true, error: null});

            const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            if (!authStorage?.state?.token) {
                set({
                    consultations: [],
                    isLoading: false,
                });
                return;
            }

            const consultations = await ConsultationApi.getConsultationsByUserId(userId);
            set({
                consultations,
                isLoading: false,
            });
        } catch (error: any) {
            if (error.response?.status !== 401) {
                set({
                    isLoading: false,
                    error: error.response?.data?.detail || 'Failed to fetch consultations',
                });
            } else {
                set({
                    consultations: [],
                    isLoading: false,
                });
            }
        }
    },

    fetchConsultationById: async (consultationId: string) => {
        try {
            set({isLoading: true, error: null});
            const consultation = await ConsultationApi.getConsultationById(consultationId);
            set({
                currentConsultation: consultation,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Failed to fetch consultation',
            });
        }
    },

    createConsultation: async (file: File) => {
        try {
            set({isLoading: true, error: null});

            const formData = new FormData();
            formData.append('file', file, file.name);

           const newConsultation = await ConsultationApi.createConsultation(file);

            set({
                consultations: [...get().consultations, newConsultation],
                currentConsultation: newConsultation,
                isLoading: false,
            });

            return newConsultation;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Failed to create consultation',
            });
            return null;
        }
    },

    assignConsultation: async (request: AssignConsultationRequest) => {
        try {
            set({isLoading: true, error: null});
            const response = await axiosInstance.post(`/consultations/${request.consultation_id}/assign`, request);

            const updatedConsultations = get().consultations.map((consultation) =>
                consultation.id === request.consultation_id ? response.data : consultation
            );

            set({
                consultations: updatedConsultations,
                currentConsultation: response.data,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Failed to assign consultation',
            });
        }
    },

    submitReport: async (request: SubmitReportRequest) => {
        try {
            set({isLoading: true, error: null});
            const response = await axiosInstance.post(`/consultations/${request.consultation_id}/submit`, request);

            const updatedConsultations = get().consultations.map((consultation) =>
                consultation.id === request.consultation_id ? response.data : consultation
            );

            set({
                consultations: updatedConsultations,
                currentConsultation: response.data,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Failed to submit report',
            });
        }
    },

    generateDraftReport: async (consultationId: string) => {
        try {
            set({isLoading: true, error: null});

            const response = await ConsultationApi.generateDraftReport(consultationId);

            const updatedConsultation = response.data;
            const updatedConsultations = get().consultations.map((consultation) =>
                consultation.id === consultationId ? updatedConsultation : consultation
            );

            set({
                consultations: updatedConsultations,
                currentConsultation: updatedConsultation,
                isLoading: false,
            });

            return updatedConsultation;
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.detail || 'Failed to generate AI report',
            });
            return null;
        }
    },

    clearError: () => set({error: null}),

    resetCurrentConsultation: () => set({currentConsultation: null}),
}));