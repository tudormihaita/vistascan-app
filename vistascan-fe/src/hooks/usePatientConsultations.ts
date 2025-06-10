import {useGetConsultationsByUserIdQuery, useSubmitConsultationMutation} from "../api/consultationApi.ts";
import {useCallback} from "react";

export const usePatientConsultations = (userId?: string) => {
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

    const submitNewConsultation = useCallback(async (file: File) => {
        return await submitConsultation(file).unwrap();
    }, [submitConsultation]);

    return {
        consultations,
        isLoading: isLoadingConsultations || isSubmittingConsultation,
        error: consultationsError || submitConsultationError,
        submitConsultation: submitNewConsultation,
    };
};