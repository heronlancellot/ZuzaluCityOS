/* eslint-disable no-unused-vars */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Stack, Typography, Box } from '@mui/material';
import { useCeramicContext } from '@/context/CeramicContext';
import { Event, Space, SpaceEventData } from '@/types';
import SubSidebar from '@/components/layout/Sidebar/SubSidebar';
import { getUserRole } from '@/services/user/getUserRole';
import { useTrustful } from '@/context/TrustfulContext';
import { capitalizeFirstLetter } from '@/utils/format';
import { Address } from 'viem';

const TrustfulPage = () => {
  const params = useParams();
  const spaceId = params.spaceid.toString();

  const [space, setSpace] = useState<Space>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState<boolean>(true);
  const { composeClient, ceramic } = useCeramicContext();
  const { setUserRole, userRole } = useTrustful();

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { username, profile } = useCeramicContext();

  const getSpaceByID = async () => {
    setIsEventsLoading(true);
    const GET_SPACE_QUERY = `
      query GetSpace($id: ID!) {
        node(id: $id) {
          ...on Space {
            avatar
            banner
            description
            name
            profileId
            tagline
            website
            twitter
            telegram
            nostr
            lens
            github
            discord
            ens
            admins {
              id
            }
            superAdmin {
              id
            }
            events(first: 10) {
              edges {
                node {
                  createdAt
                  description
              endTime
              timezone
              status
              tagline
              imageUrl
              externalUrl
              gated
              id
              meetingUrl
              profileId
              spaceId
              startTime
              title
              space {
                avatar
                name
              }
                }
              }
            }
          }
        }
      }
      `;

    const response: any = await composeClient.executeQuery(GET_SPACE_QUERY, {
      id: spaceId,
    });
    const spaceData: Space = response.data.node as Space;
    setSpace(spaceData);
    const eventData: SpaceEventData = response.data.node
      .events as SpaceEventData;
    const fetchedEvents: Event[] = eventData.edges.map((edge) => edge.node);
    setEvents(fetchedEvents);
    return spaceData;
  };
  useEffect(() => {
    const fetchData = async () => {
      const space = await getSpaceByID();
      document.title = space?.name + ' - ' + 'Zuzalu City';
      const admins =
        space?.admins?.map((admin) => admin.id.toLowerCase()) || [];
      const superAdmins =
        space?.superAdmin?.map((superAdmin) => superAdmin.id.toLowerCase()) ||
        [];
      const userDID = ceramic?.did?.parent.toString().toLowerCase() || '';
      if (admins.includes(userDID) || superAdmins.includes(userDID)) {
        setIsAdmin(true);
      }
    };

    fetchData()
      .catch((error) => {
        console.error('An error occurred:', error);
      })
      .finally(() => {
        setIsEventsLoading(false);
      });
  }, []);

  const address = useMemo(() => {
    if (profile) {
      const id = profile.author?.id.split(':');
      return id?.[id?.length - 1];
    }
  }, [profile]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (address) {
        await getUserRole(address as Address)
          .then((data) => {
            console.log('User role:', data);
            if (data && data?.role) {
              setUserRole({
                address: address as Address,
                role: data.role,
              });
            }
          })
          .catch((error) => console.error('Failed to fetch events:', error));
      }
    };
    fetchUserRole();
  }, [address]);

  return (
    <Stack direction="row" height="calc(100vh - 50px)" width="100%">
      <SubSidebar
        avatar={space?.avatar}
        banner={space?.banner}
        title={space?.name}
        spaceId={params.spaceid.toString()}
        isAdmin={isAdmin}
      />
      <Stack
        flex={1}
        sx={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px',
          }}
        >
          <Typography color="white" variant="subtitleLB">
            Welcome{' '}
            {userRole && userRole.role !== 'NO_ROLE'
              ? capitalizeFirstLetter(userRole.role).split('_')[0]
              : username
                ? username
                : address}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default TrustfulPage;
