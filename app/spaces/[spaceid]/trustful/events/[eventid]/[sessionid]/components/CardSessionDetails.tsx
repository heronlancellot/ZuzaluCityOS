'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Text } from '@chakra-ui/react';
// import { useTrustful } from '@/context/TrustfulContext';
import toast from 'react-hot-toast';
import {
  getSession,
  GetSessionResponse,
} from '@/app/spaces/[spaceid]/trustful/service/backend';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

export const CardSessionDetails = () => {
  const [sessions, setSessions] = useState<GetSessionResponse[] | undefined>(
    [],
  );
  const params = useParams();
  const spaceId = params.spaceid.toString();
  console.log('paramsparams', params);
  const actualURL = `/spaces/${spaceId}/trustful/events/${params.eventid}/sessions`;
  const { push } = useRouter();
  const { address } = useAccount();
  // const { userRole } = useTrustful();

  if (!address) {
    toast.error('User not found');
    return;
  }

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const sessionsData = await getSession({
          userAddress: address as Address,
          eventid: Number(params.eventid),
        });
        if (sessionsData) {
          setSessions([sessionsData]);
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    fetchAllEvents();
  }, []);

  return (
    <>
      {/* {sessions && sessions.length > 0 && (
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
      )} */}

      <Card
        background={'#F5FFFF0D'}
        className="w-full border border-[#F5FFFF14] border-opacity-[8] p-4 gap-2"
        onClick={() => {
          const eventId = 123;
          push(`${actualURL}/${params.sessionid}`);
        }}
      >
        Estamos no evento especifico , aqui podemos criar umma sessão se formos
        o root, ao criar as sessoes, vamos poder ver as sessoes criadas e os
        participantes que estão nela , e podemos dar badges para os
        participantes; Pode ter um button do dropdown pra criar sessão e ir para
        sessoes quando for para sesssoes ai vai ser no /sessions depois
        Sessssion Name:Blockchain Workshop description: workshop Session
        blockchain technology
      </Card>
    </>
  );
};
