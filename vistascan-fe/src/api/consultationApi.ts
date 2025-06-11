import {apiSlice} from "./apiSlice.ts";
import {AssignConsultationRequestDto, ConsultationDto, SubmitReportRequestDto} from "../types/dtos/ConsultationDto.ts";

export const consultationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConsultationsByUserId: builder.query<ConsultationDto[], string>({
            query: (userId) => `/consultations?user_id=${userId}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'consultationsCache' as const, id })),
                        'consultationsCache'
                      ]
                    : ['consultationsCache'],
        }),
        getConsultationById: builder.query<ConsultationDto, string>({
            query: (consultationId) => `/consultations/${consultationId}`,
            providesTags: (_result, _error, id) => [{ type: 'consultationsCache', id }],
        }),
        getConsultationsByStatus: builder.query<ConsultationDto[], string>({
            query: (status) => `/consultations?status=${status}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'consultationsCache' as const, id })),
                        'consultationsCache'
                      ]
                    : ['consultationsCache'],
        }),
        submitConsultation: builder.mutation<ConsultationDto, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file, file.name);
                return {
                    url: '/consultations',
                    method: 'POST',
                    body: formData,
                    headers: {}
                };
            },
            invalidatesTags: ['consultationsCache', 'allConsultationsCache'],
        }),
        assignConsultation: builder.mutation<ConsultationDto, AssignConsultationRequestDto>({
            query: (request ) => ({
                url: `/consultations/${request.consultation_id}/assign`,
                method: 'POST',
                body: request
            }),
            invalidatesTags: (_result, _error, { consultation_id }) => [
                { type: 'consultationsCache', id: consultation_id },
                'consultationsCache'
            ],
        }),
        submitReport: builder.mutation<ConsultationDto, SubmitReportRequestDto>({
            query: (request) => ({
                url: `/consultations/${request.consultation_id}/submit`,
                method: 'POST',
                body: request
            }),
            invalidatesTags: (_result, _error, { consultation_id }) => [
                { type: 'consultationsCache', id: consultation_id },
                'consultationsCache',
                'allConsultationsCache'
            ],
        }),
        generateDraftReport: builder.mutation<ConsultationDto, string>({
            query: (consultationId) => ({
                url: `/consultations/${consultationId}/generate-report`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, consultationId) => [
                { type: 'consultationsCache', id: consultationId },
                'consultationsCache'
            ],
        }),
        getImageDownloadUrl: builder.query<{ download_url: string }, string>({
            query: (consultationId) => `consultations/${consultationId}/download`,
        })
    }),
});

export const {
    useGetConsultationsByUserIdQuery,
    useGetConsultationByIdQuery,
    useGetConsultationsByStatusQuery,
    useSubmitConsultationMutation,
    useAssignConsultationMutation,
    useSubmitReportMutation,
    useGenerateDraftReportMutation,
    useGetImageDownloadUrlQuery
} = consultationApi;