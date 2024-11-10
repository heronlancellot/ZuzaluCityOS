import toast from 'react-hot-toast';
import { Address } from 'viem';

export type Event = {
  eventId: number;
  zucityId: number | null;
  name: string;
  description: string;
  spaceId: string | number;
  createdAt: Date;
  updatedAt: Date;
};

export const getAllEvents = async ({
  userAddress,
  spaceId,
}: {
  spaceId: string | number;
  userAddress: Address;
}): Promise<Event[] | undefined> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_RAILWAY_TRUSTFUL}/events/space/${spaceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          userAddress: `${userAddress}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Event[] = await response.json();

    return data;
  } catch (error) {
    console.error('Error getting events:', error);
    throw new Error(`Error getting events information`);
  }
};
