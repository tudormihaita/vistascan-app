import axiosInstance from '../utils/axios';

export const ConsultationApi = {
  /**
   * Upload a file to create a new consultation
   */
  createConsultation: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await axiosInstance.post('/consultations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Get consultation by ID
   */
  getConsultationById: async (consultationId: string) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}`);
    return response.data;
  },

  /**
   * Get consultations by user ID
   */
  getConsultationsByUserId: async (userId: string) => {
    const response = await axiosInstance.get(`/consultations?user_id=${userId}`);
    return response.data;
  },

  /**
   * Download the image file associated with a consultation
   */
  getImageDownloadUrl: async (consultationId: string) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/download`);
    return response.data.download_url;
  },

  /**
   * Generate a draft report for a consultation
   */
  generateDraftReport: async (consultationId: string) => {
    return await axiosInstance.post(`/consultations/${consultationId}/generate-report`);
  }
};