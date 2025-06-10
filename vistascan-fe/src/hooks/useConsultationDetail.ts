import {useGetConsultationByIdQuery, useGetImageDownloadUrlQuery} from "../api/consultationApi.ts";

export const useConsultationDetail = (consultationId?: string) => {
    const {
        data: consultation,
        isLoading,
        error
    } = useGetConsultationByIdQuery(consultationId!, {
        skip: !consultationId
    });

    const {
        data: downloadUrl,
        isLoading: isLoadingUrl
    } = useGetImageDownloadUrlQuery(consultationId!, {
        skip: !consultationId
    });

    return {
        consultation,
        downloadUrl: downloadUrl?.download_url,
        isLoading: isLoading || isLoadingUrl,
        error
    };
};