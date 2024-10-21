import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
export const createApplicationForm = async (createApplicationFormInput: {
  eventId: string;
  profileId: string;
  answers: any;
}) => {
  try {
    const response = await axiosInstance.post(
      '/api/event/applicationForm/create',
      createApplicationFormInput,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};
