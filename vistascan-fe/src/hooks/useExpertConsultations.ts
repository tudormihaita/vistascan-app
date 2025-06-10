import {
    useAssignConsultationMutation, useGenerateDraftReportMutation,
    useGetConsultationsByUserIdQuery,
    useSubmitConsultationMutation, useSubmitReportMutation
} from "../api/consultationApi.ts";
import {useCallback} from "react";
import {AssignConsultationRequestDto, SubmitReportRequestDto} from "../types/dtos/ConsultationDto.ts";

export const useExpertConsultations = (userId?: string) => {
    const {
        data: consultations = [],
        isLoading: isLoadingConsultations,
        error: consultationsError,
    } = useGetConsultationsByUserIdQuery(userId!, {
        skip: !userId
    });

    const [submitConsultation, {
        isLoading: isSubmittingConsultation,
        error: submitConsultationError
    }] = useSubmitConsultationMutation();

    const [assignConsultation, {
        isLoading: isAssigning,
        error: assignError
    }] = useAssignConsultationMutation();

    const [submitReport, {
        isLoading: isSubmittingReport,
        error: submitReportError
    }] = useSubmitReportMutation();

    const [generateReport, {
        isLoading: isGenerating,
        error: generateError
    }] = useGenerateDraftReportMutation();

    const submitNewConsultation = useCallback(async (file: File) => {
        return await submitConsultation(file).unwrap();
    }, [submitConsultation]);

    const assignToExpert = useCallback(async (request: AssignConsultationRequestDto) => {
        return await assignConsultation(request).unwrap();
    }, [assignConsultation]);

    const submitConsultationReport = useCallback(async (request: SubmitReportRequestDto) => {
        return await submitReport(request).unwrap();
    }, [submitReport]);

    const generateDraftReport = useCallback(async (consultationId: string) => {
        return await generateReport(consultationId).unwrap();
    }, [generateReport]);

    return {
        consultations,
        isLoading: isLoadingConsultations || isSubmittingConsultation || isAssigning || isSubmittingReport || isGenerating,
        error: consultationsError || submitConsultationError || assignError || submitReportError || generateError,
        submitConsultation: submitNewConsultation,
        assignConsultation: assignToExpert,
        submitReport: submitConsultationReport,
        generateDraftReport: generateDraftReport
    };
};
