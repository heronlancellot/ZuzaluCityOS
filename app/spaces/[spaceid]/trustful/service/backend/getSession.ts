import toast from 'react-hot-toast';
import { Address } from 'viem';

type Session = {
  name: string;
  sessionId: number;
  createdAt: Date;
  updatedAt: Date;
  zucityId: number | null;
  hostAddress: string;
  eventId: number;
  endAt: Date | null;
};

export interface GetSessionResponse {
  sessions: Session[];
  total: number;
  page: number;
  totalPages: number;
}

interface getSessionRequest {
  userAddress: Address;
  eventid: number;
  page?: number;
  limit?: number;
  filters?: {
    eventId?: number;
    hostAddress?: string;
    fromDate?: Date;
    toDate?: Date;
  };
}

//TODO: Filter by id
export const getSession = async ({
  userAddress,
  eventid,
  page,
  limit,
  filters,
}: getSessionRequest): Promise<GetSessionResponse | undefined> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAILWAY_TRUSTFUL}/sessions?page=1&limit=100&eventId=${eventid}&hostAddress=${userAddress}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: GetSessionResponse = await response.json();

    return data;
  } catch (error) {
    console.error('Error getting session:', error);
    toast.error('An unexpected error occurred while get the session.');
    throw new Error(`Error getting session information`);
  }
};
