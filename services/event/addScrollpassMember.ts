import { AddScrollpassMemberRequest } from '@/types';
import axiosInstance from '@/utils/axiosInstance';
import axios from 'axios';
export const updateScrollpassMember = async (
  scrollpassMemberInput: AddScrollpassMemberRequest,
) => {
  try {
    const response = await axiosInstance.post(
      '/api/event/updateScrollpassMember',
      scrollpassMemberInput,
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};
