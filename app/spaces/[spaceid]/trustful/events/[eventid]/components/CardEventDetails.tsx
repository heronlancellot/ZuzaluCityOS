'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
import { getEventById, Event } from '../../../service';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

export const CardEventDetails = () => {
  const [eventDetails, setEventDetails] = useState<Event | undefined>(
    undefined,
  );
  const params = useParams();
  const spaceId = params.spaceid.toString();
  const actualURL = `/spaces/${spaceId}/trustful/events/${params.eventid}`;
  const { push } = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    const fetchEventById = async () => {
      if (!address) {
        toast.error('Please connect first. No address found.');
        return;
      }
      try {
        const eventsData = await getEventById({
          spaceId: Number(spaceId),
          userAddress: address as Address,
        });
        if (eventsData) {
          setEventDetails(eventsData);
        }
        console.log('eventsData', eventsData);
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchEventById();
  }, [address, spaceId]); //TODO: ADD eventcreated here

  return (
    <>
      {eventDetails && (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Event Details
          </Text>

          <Card background={'#222222'} className="mb-4 p-4">
            <Text className="text-white font-semibold text-lg">
              {eventDetails.name}
            </Text>
            <Text className="text-gray-400">{eventDetails.description}</Text>
            <Text className="text-gray-500 text-sm">
              Space ID: {eventDetails.spaceId}
            </Text>
            <Text className="text-gray-500 text-sm">
              Created at: {new Date(eventDetails.createdAt).toLocaleString()}
            </Text>
          </Card>
        </Card>
      )}
    </>
  );
};
