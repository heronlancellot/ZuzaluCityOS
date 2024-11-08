'use client';

import { useEffect, useState } from 'react';
import { Event, getAllEvents } from '../../service/backend/getAllEvents';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

export const CardEvents = () => {
  const [events, setEvents] = useState<Event[] | undefined>([]);
  const params = useParams();
  const spaceId = params.spaceid.toString();
  const actualURL = `/spaces/${params.spaceid}/trustful/events`;
  const { push } = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const eventsData = await getAllEvents({
          spaceId: Number(spaceId),
          userAddress: address as Address,
        });
        setEvents(eventsData);
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchAllEvents();
  }, []);
  return (
    <>
      {events && events.length > 0 && (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Events
          </Text>
          {events.map((event, index) => (
            <Text key={index} className="text-white">
              {event.name}
            </Text>
          ))}
        </Card>
      )}

      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        onClick={() => {
          const eventId = 123;
          push(`${actualURL}/${eventId}`);
        }}
      >
        event Name:Blockchain Workshop description: workshop about blockchain
        technology
      </Card>
    </>
  );
};
