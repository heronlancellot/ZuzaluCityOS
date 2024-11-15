import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
export const updateTicketImage = async (updateTicketImageInput: {
  eventId: string;
  contractAddress: string;
  image_url: string;
}) => {
  try {
    const response = await axiosInstance.post(
      '/api/event/updateTicketImage',
      updateTicketImageInput,
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
