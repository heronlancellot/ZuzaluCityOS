'use client';

import { useEffect, useState } from 'react';
import { Event } from '../../service/backend/getEventById';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { getAllEvents } from '../../service/backend/getAllEvents';
import { getSession } from '../../service';

export const CardEvents = () => {
  const [events, setEvents] = useState<
    (Event & { totalSessions?: number })[] | undefined
  >([]);
  const params = useParams();
  const spaceId = params.spaceid.toString();
  const actualURL = `/spaces/${params.spaceid}/trustful/events`;
  const { push } = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    if (!address) {
      toast.error('Please connect first. No address found.');
      return;
    }

    const fetchEventsWithSessions = async () => {
      try {
        const eventsData: Event[] | undefined = await getAllEvents({
          spaceId: Number(spaceId),
          userAddress: address as Address,
        });

        const eventsWithSessions = eventsData
          ? await Promise.all(
              eventsData.map(async (event: Event) => {
                const sessionData = await getSession({
                  userAddress: address as Address,
                  eventid: event.eventId,
                });
                return {
                  ...event,
                  totalSessions: sessionData?.total ?? 0,
                };
              }),
            )
          : [];

        setEvents(eventsWithSessions);
      } catch (error) {
        console.error('Error fetching events or sessions:', error);
        toast.error('An error occurred while loading events and sessions.');
      }
    };

    fetchEventsWithSessions();
  }, [address, spaceId]); // TODO: Adicionar dependências aqui conforme necessário

  console.log('events', events);

  return (
    <>
      {events && events.length > 0 ? (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Events
          </Text>
          {events.map((event, index) => (
            <Card
              key={index}
              background={'#222222'}
              className="mb-4 p-4 cursor-pointer"
              onClick={() => push(`${actualURL}/${event.eventId}`)}
            >
              <Text className="text-white font-semibold text-lg">
                {event.name}
              </Text>
              <Text className="text-gray-400">{event.description}</Text>
              <Text className="text-gray-500 text-sm">
                Space ID: {event.spaceId}
              </Text>
              <Text className="text-gray-500 text-sm">
                Event ID: {event.eventId}
              </Text>
              <Text className="text-gray-500 text-sm">
                Created at: {new Date(event.createdAt).toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-sm">
                Total Sessions: {event.totalSessions}
              </Text>
            </Card>
          ))}
        </Card>
      ) : (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Connect your account to check the Events!
          </Text>
        </Card>
      )}
    </>
  );
};
