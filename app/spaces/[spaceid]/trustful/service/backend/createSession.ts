import { Role } from '@/app/spaces/[spaceid]/trustful/constants/constants';
import toast from 'react-hot-toast';
import { Address } from 'viem';

interface createSessionResponse {
  sessionId: number;
  name: string;
  hostAddress: Address;
  eventId: number;
  zucityId: number | null;
  createdAt: Date;
  updatedAt: Date;
  endAt: Date;
}

interface createSessionRequest {
  name: string;
  hostAddress: Address;
  eventId: number;
  zucityId?: number | null;
}

export const createSession = async (
  userAddress: Address,
  role: Role,
): Promise<createSessionResponse | undefined> => {
  if (role !== Role.MANAGER && role !== Role.ROOT) {
    toast.error('User Address is not a manager or root');
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAILWAY_TRUSTFUL}/session?userAddress=${userAddress}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Session',
          hostAddress: userAddress,
          eventId: 1,
        } as createSessionRequest),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: createSessionResponse = await response.json();
    toast.success('Session created successfully!');

    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    toast.error('An unexpected error occurred while creating the session.');
    throw new Error('Error creating session');
  }
};
