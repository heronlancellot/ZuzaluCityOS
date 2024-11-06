import { Role } from '@/app/spaces/[spaceid]/trustful/constants/constants';
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

interface JoinSessionResponse {
  sessions: Session[];
  total: number;
  page: number;
  totalPages: number;
}

interface getSessionRequest {
  userAddress: Address;
  role: Role;
  page: number;
  limit: number;
  filters?: {
    eventId?: number;
    hostAddress?: string;
    fromDate?: Date;
    toDate?: Date;
  };
}

export const getSession = async ({
  userAddress,
  role,
  limit,
  page,
}: getSessionRequest): Promise<JoinSessionResponse | undefined> => {
  if (role === Role.NO_ROLE) {
    toast.error("User Address doesn't have a role");
    return;
  } else if (
    role !== Role.MANAGER &&
    role !== Role.ROOT &&
    role !== Role.VILLAGER
  ) {
    toast.error('User Address is not a manager, root or villager');
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAILWAY_TRUSTFUL}/sessions/`,
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
    const data: JoinSessionResponse = await response.json();

    return data;
  } catch (error) {
    console.error('Error getting session:', error);
    toast.error('An unexpected error occurred while get the session.');
    throw new Error(`Error getting session information`);
  }
};
