'use client';
import { Stack, Typography, Box, Skeleton } from '@mui/material';
import {
  ArrowForwardIcon,
  CalendarIcon,
  LottoPGFIcon,
  QRCodeIcon,
  ScrollPassIcon,
  ZuPassIcon,
} from '@/components/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useCeramicContext } from '@/context/CeramicContext';
import { useEffect, useMemo, useState } from 'react';
import { EventData, Event, ScrollPassTickets } from '@/types';
import Image from 'next/image';

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
                        eventId
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

  const tabs = useMemo(() => {
    return [
      {
        label: 'Scrollpass',
        icon: <ScrollPassIcon size={5} />,
        content: tickets.length,
        disabled: false,
      },
      {
        label: 'ZuLotto',
        icon: <LottoPGFIcon size={5} />,
        content: 'Coming Soon',
        disabled: true,
      },
      {
        label: 'Zupass',
        icon: <ZuPassIcon size={5} />,
        content: 'Coming Soon',
        disabled: true,
      },
    ];
  }, [tickets.length]);

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
      spacing="40px"
      sx={{ margin: '0 auto', color: 'white' }}
      maxWidth={'680px'}
      py="30px"
    >
      <Stack pb="30px" onClick={() => router.push(`/passport/scanqr/${1}`)}>
        <Typography fontSize="24px" fontWeight={700} lineHeight={1.2}>
          Your Passport
        </Typography>
        <Stack direction="row" spacing="20px" alignItems="center" mt="20px">
          {tabs.map((tab, index) => (
            <Stack
              key={`tab-${index}`}
              direction="row"
              spacing="10px"
              alignItems="center"
              p="6px 10px"
              borderRadius="10px"
              bgcolor="rgba(255, 255, 255, 0.15)"
              width="fit-content"
              sx={{
                opacity: tab.disabled ? 0.5 : 1,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {tab.icon}
              <Typography fontSize="18px" lineHeight={1.2}>
                {tab.label}
              </Typography>
              <Box
                sx={{
                  p: '2px 6px',
                  borderRadius: '20px',
                  bgcolor: 'rgba(255, 255, 255, 0.10)',
                  textAlign: 'center',
                }}
              >
                <Typography fontSize="12px" fontWeight={600} lineHeight={1.2}>
                  {tab.content}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
        <Stack my="60px" alignItems="center" justifyContent="center">
          <Box position="relative">
            <Image
              src="/user/avatar_p.png"
              alt="profile"
              height={80}
              width={80}
              style={{ position: 'relative', zIndex: 1 }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '-29px',
                left: '-29px',
                width: '130px',
                height: '130px',
                background:
                  'url(/user/avatar_p.png) lightgray 50% / cover no-repeat',
                borderRadius: '100px',
                opacity: 0.4,
                filter: 'blur(25px)',
              }}
            />
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing="14px"
          padding="10px"
          alignItems="center"
          bgcolor="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.10)"
          borderRadius="10px"
          sx={{ opacity: 0.8, cursor: 'pointer' }}
        >
          <QRCodeIcon />
          <Typography variant="subtitleSB" color="white">
            Scan QR Code
          </Typography>
        </Stack>
      </Stack>
      <Stack
        p="20px"
        spacing="20px"
        border="1px solid rgba(255, 255, 255, 0.10)"
        borderRadius="10px"
      >
        <Stack direction="row" alignItems="center" spacing="10px" pb="10px">
          <CalendarIcon />
          <Typography fontSize="20px" fontWeight={700} lineHeight={1.2}>
            Event Credentials
          </Typography>
        </Stack>
        <Stack spacing="10px">
          {isLoading ? (
            <Skeleton variant="rounded" width="100%" height="72px" />
          ) : (
            events.map((item, index) => (
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
                border="1px solid rgba(255, 255, 255, 0.10)"
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
                      You have{' '}
                      {
                        tickets.filter((ticket) => ticket.eventId === item.id)
                          .length
                      }{' '}
                      ticket
                    </Typography>
                  </Stack>
                  <ArrowForwardIcon />
                </Stack>
              </Stack>
            ))
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Home;
