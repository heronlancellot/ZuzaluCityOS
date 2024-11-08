import { Role } from '@/app/spaces/[spaceid]/trustful/constants/constants';
import toast from 'react-hot-toast';
import { Address } from 'viem';

interface createEventResponse {
  eventId: number;
  zucityId: number | null;
  name: string;
  description: string;
  spaceId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  address: Address;
  role: Role;
}

interface createEventsRequest {
  user: User;
  name: string;
  description: string;
  spaceId: number;
  zucityId?: number | null;
}

export const createEvents = async ({
  user,
  name,
  description,
  spaceId,
  zucityId,
}: createEventsRequest): Promise<createEventResponse | undefined> => {
  if (user.role !== Role.MANAGER && user.role !== Role.ROOT) {
    toast.error('User Address is not a manager or root');
    return;
  }

  console.log('user.address', user.address);
  console.log('name', name);
  console.log('description', description);
  console.log('spaceId', spaceId);
  console.log('zucityId', zucityId);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAILWAY_TRUSTFUL}/events?userAddress=${user.address}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          description: description,
          spaceId: spaceId,
          zucityId: zucityId,
        } as createEventsRequest),
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: createEventResponse = await response.json();
    toast.success('Session created successfully!');

    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    toast.error('An unexpected error occurred while creating the session.');
    throw new Error('Error creating session');
  }
};
