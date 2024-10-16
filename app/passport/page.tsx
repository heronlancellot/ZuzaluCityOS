'use client';
import { Stack, Typography, Box } from '@mui/material';
import { MOCK_DATA } from 'mock';
import { ArrowForwardIcon, QRCodeIcon } from '@/components/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useCeramicContext } from '@/context/CeramicContext';
import { useEffect, useState } from 'react';
import { EventData, Event, ScrollPassTickets } from '@/types';

const Home = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, composeClient, ceramic, username } =
    useCeramicContext();

  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<ScrollPassTickets[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTickets = async () => {
    const GET_Profile_QUERY = `
            query MyQuery {
                viewer {
                    zucityProfile {
                    id
                    myScrollPassTickets {
                        checkin
                        contractAddress
                        description
                        image_url
                        name
                        price
                        status
                        tbd
                        tokenType
                        type
                    }
                    }
                }
                }
        `;
    const getProfileResponse: any =
      await composeClient.executeQuery(GET_Profile_QUERY);
    setTickets(
      getProfileResponse.data.viewer.zucityProfile.myScrollPassTickets,
    );
  };

  const getEvents = async () => {
    try {
      const response: any = await composeClient.executeQuery(`
      query {
        zucityEventIndex(first: 100) {
          edges {
            node {
              id
              imageUrl
              title
              members{
              id
              }
              admins{
              id
              }
              superAdmin{
              id
              }
              profile {
                username
                avatar
              }
              space {
                name
                avatar
              }
              tracks
            }
          }
        }
      }
    `);

      if (response && response.data && 'zucityEventIndex' in response.data) {
        const eventData: EventData = response.data as EventData;
        return eventData.zucityEventIndex.edges.map((edge) => edge.node);
      } else {
        console.error('Invalid data structure:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let eventsData = await getEvents();
        await getTickets();
        if (eventsData) {
          eventsData =
            eventsData.filter((eventDetails) => {
              const admins =
                eventDetails?.admins?.map((admin) => admin.id.toLowerCase()) ||
                [];
              const superadmins =
                eventDetails?.superAdmin?.map((superAdmin) =>
                  superAdmin.id.toLowerCase(),
                ) || [];
              const members =
                eventDetails?.members?.map((member) =>
                  member.id.toLowerCase(),
                ) || [];
              const userDID =
                ceramic?.did?.parent.toString().toLowerCase() || '';
              return (
                superadmins.includes(userDID) ||
                admins.includes(userDID) ||
                members.includes(userDID)
              );
            }) || [];
          setEvents(eventsData);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    isAuthenticated && fetchData();
  }, [ceramic?.did?.parent, isAuthenticated]);

  return (
    <Stack
      justifyContent={'center'}
      padding="30px"
      spacing="40px"
      sx={{ margin: '0 auto' }}
      maxWidth={'640px'}
    >
      <Stack
        pb="30px"
        borderBottom="1px solid #383838"
        spacing="40px"
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(`/passport/scanqr/${1}`)}
      >
        <Typography color="white" variant="subtitleLB">
          Your Passport
        </Typography>
        <Stack
          direction="row"
          spacing="14px"
          padding="10px"
          alignItems="center"
          bgcolor="#262626"
          borderRadius="10px"
        >
          <QRCodeIcon />
          <Stack spacing="4px">
            <Typography variant="subtitleSB" color="white">
              Scan QR Code
            </Typography>
            <Typography variant="caption" color="white">
              Scan tickets
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack spacing="30px" pb="30px">
        <Typography color="white" variant="subtitleMB">
          ScrollPass Credentials
        </Typography>
        <Stack spacing="10px">
          {events.map((item, index) => (
            <Stack
              sx={{ cursor: 'pointer' }}
              onClick={() => router.push(`passport/${item.id}`)}
              key={`Scrollpass-Credential-${index}`}
              direction="row"
              spacing="14px"
              padding="10px"
              alignItems="center"
              bgcolor="#262626"
              borderRadius="10px"
            >
              <Box
                component="img"
                src={item.imageUrl}
                alt={item.imageUrl}
                width="50px"
                height="50px"
                borderRadius="4px"
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                flex={1}
                alignItems="center"
              >
                <Stack spacing="4px">
                  <Typography variant="subtitleSB" color="white">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="white">
                    You have 1 ticket
                  </Typography>
                </Stack>
                <ArrowForwardIcon />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Home;
