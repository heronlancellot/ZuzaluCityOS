'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
import { getSession, GetSessionResponse } from '../../../service';
import { useAccount } from 'wagmi';

export const CardSession = () => {
  const [sessions, setSessions] = useState<GetSessionResponse[] | undefined>(
    [],
  );
  const params = useParams();
  const spaceId = params.spaceid.toString();
  console.log('paramsparams', params);
  const actualURL = `/spaces/${spaceId}/trustful/events/${params.eventid}`;
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
      {sessions && sessions.length > 0 && (
        <Card
          background={'#F5FFFF0D'}
          className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        >
          <Text className="text-white mb-2 font-medium leading-none">
            Sessions
          </Text>
          {sessions.map((session, index) => (
            <Card
              key={index}
              background={'#222222'}
              className="mb-4 p-4 cursor-pointer"
              onClick={() =>
                push(`${actualURL}/${session.sessions[index].sessionId}`)
              }
            >
              <Text className="text-white font-semibold text-lg">
                {session.sessions[index].name}
              </Text>
              <Text className="text-gray-500 text-sm">
                Event ID: {session.sessions[index].eventId}
              </Text>
              <Text className="text-gray-500 text-sm">
                Created at:{' '}
                {new Date(session.sessions[index].createdAt).toLocaleString()}
              </Text>
            </Card>
          ))}
        </Card>
      )}
    </>
  );
};
