'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
import { getSession, GetSessionResponse } from '../../../service';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

export const CardSession = () => {
  const [sessions, setSessions] = useState<GetSessionResponse[] | undefined>(
    [],
  );
  const params = useParams();
  const spaceId = params.spaceid.toString();
  console.log('paramsparams', params);
  const actualURL = `/spaces/${spaceId}/trustful/events/${params.eventid}/sessions`;
  const { push } = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const allEventSessionsData = await getSession({
          eventid: Number(params.eventid),
        });
        if (allEventSessionsData) {
          setSessions([allEventSessionsData]);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchAllEvents();
    console.log('sessions', sessions);
  }, [address]);

  return (
    <>
      <div>sessions card</div>
      {/* {sessions && sessions.length > 0 ? (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Events
          </Text>
          {sessions.map((session, index) => (
            <Text key={index} className="text-white">
              {session.sessions[index].name}
            </Text>
          ))}
        </Card>
      ) : (
        {
          sessions,
        }
      )} */}
    </>
  );
};
