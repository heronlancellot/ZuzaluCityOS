'use client';
import { useParams } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { Box, Snackbar, Typography, Alert, useMediaQuery } from '@mui/material';
import { EventCard } from '@/components/cards';
// import AnnouncementCard from 'components/AnnouncementCart';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  EventIcon,
  HomeIcon,
  PlusCircleIcon,
  ShareIcon,
} from 'components/icons';
import { RightArrowCircleSmallIcon } from 'components/icons/RightArrowCircleSmall';
import SidebarButton from 'components/layout/Sidebar/SidebarButton';
import { MOCK_DATA } from 'mock';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import SubSidebar from 'components/layout/Sidebar/SubSidebar';
import { useCeramicContext } from '@/context/CeramicContext';
import { Space, Event, SpaceEventData } from '@/types';
import { Sidebar } from '@/components/layout';
// import { SubSidebar } from '@/components/layout';

export default function SpaceDetailPage() {
  const params = useParams();
  const theme = useTheme();
  const { composeClient } = useCeramicContext();
  const [aboutContent, setAboutContent] = useState<string>('');
  const [showMore, setShowMore] = useState(false);
  const [space, setSpace] = useState<Space>();
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentHref, setCurrentHref] = useState('');
  useEffect(() => {
    setCurrentHref(window.location.href);
  }, []);

  const getSpace = async () => {
    try {
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
            events(first: 10) {
              edges {
                node {
                  createdAt
                  description
                  endTime
                  external_url
                  gated
                  id
                  image_url
                  max_participant
                  meeting_url
                  min_participant
                  participant_count
                  profileId
                  spaceId
                  startTime
                  status
                  tagline
                  timezone
                  title
                }
              }
            }
          }
        }
      }
      `;
      const spaceId = params.spaceid.toString();

      const response: any = await composeClient.executeQuery(GET_SPACE_QUERY, {
        id: spaceId,
      });
      console.log(response);
      const spaceData: Space = response.data.node as Space;
      setSpace(spaceData);
      const eventData: SpaceEventData = response.data.node
        .events as SpaceEventData;
      const fetchedEvents: Event[] = eventData.edges.map((edge) => edge.node);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch space:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getSpaceByID();
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (showMore) {
      const description = space?.description ?? '';
      const shortDescription = description.substring(0, 30);
      setAboutContent(shortDescription);
    } else {
      setAboutContent(space?.description as string);
    }
  }, [showMore]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
      }}
    >
      <SubSidebar title={space?.name} spaceId={params.spaceid.toString()} />
      <Box
        sx={{
          width: 'calc(100% - 280px)',
          [theme.breakpoints.down('lg')]: {
            width: '100%',
          },
          fontFamily: 'Inter',
        }}
      >
        <Box
          sx={{
            padding: '20px',
            width: '100%',
            backgroundColor: '#2b2b2b',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderBottom: '1px solid #ffffff1a',
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '240px',
            }}
          >
            <Image
              loader={() =>
                'https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png?scale-down-to=512 512w, https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png?scale-down-to=1024 1024w, https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png 1920w'
              }
              src={
                'https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png?scale-down-to=512 512w, https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png?scale-down-to=1024 1024w, https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png 1920w'
              }
              alt=""
              width={'100'}
              height={'240'}
              style={{
                position: 'absolute',
                inset: 0,
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                borderRadius: '10px',
              }}
              className="absolute inset-0 object-cover w-full h-full rounded-[10px]"
            />
            <Box
              sx={{
                width: '90px',
                height: '90px',
                backgroundColor: '#2b2b2b',
                position: 'absolute',
                bottom: '-30px',
                borderRadius: '100%',
                left: '20px',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <Image
                loader={() =>
                  'https://framerusercontent.com/images/UkqE1HWpcAnCDpQzQYeFjpCWhRM.png'
                }
                src={
                  'https://framerusercontent.com/images/UkqE1HWpcAnCDpQzQYeFjpCWhRM.png'
                }
                width={80}
                height={80}
                alt=""
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
              }}
            >
              <SidebarButton
                content="Join Space"
                sx={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff0a',
                  '&:hover': {
                    backgroundColor: '#ffffff1a',
                  },
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  alignItems: 'center',
                }}
                icon={<PlusCircleIcon />}
              ></SidebarButton>
              <CopyToClipboard
                text={currentHref}
                onCopy={() => {
                  setShowCopyToast(true);
                }}
              >
                <SidebarButton
                  sx={{
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff0a',
                    '&:hover': { backgroundColor: '#ffffff1a' },
                    cursor: 'pointer',
                  }}
                  icon={<ShareIcon />}
                >
                  <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={showCopyToast}
                    autoHideDuration={800}
                    onClose={() => {
                      setShowCopyToast(false);
                    }}
                  >
                    <Alert severity="success" variant="filled">
                      Copy share link to clipboard
                    </Alert>
                  </Snackbar>
                </SidebarButton>
              </CopyToClipboard>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingLeft: '20px',
              paddingRight: '20px',
            }}
          >
            <Typography fontWeight={700} fontSize={'25px'} lineHeight={'120%'}>
              {space?.name}
            </Typography>
            <Typography color={'#bebebe'}>{space?.tagline}</Typography>
            <Box
              sx={{
                color: '#7b7b7b',
                fontSize: '10px',
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                textTransform: 'uppercase',
              }}
            >
              <p>{space?.category}</p>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#222222',
          }}
        >
          <Box
            sx={{
              padding: '20px',
              gap: '20px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#919191',
              }}
            >
              About {space?.name}
            </Box>
            <Box
              sx={{
                padding: '20px',
                width: '100%',
                backgroundColor: '#ffffff05',
                borderRadius: '10px',
                height: 'fit-content',
                boxSizing: 'border-box',
              }}
            >
              <Box
                sx={{
                  fontWeight: '700',
                  color: 'white',
                  marginTop: '12px',
                  fontSize: '18px',
                  lineHeight: '160%',
                }}
              >
                {space?.name}
              </Box>
              <Box
                sx={{
                  marginTop: '12px',
                  color: 'white',
                  opacity: '0.8',
                  fontWeight: '400',
                  fontSize: '14px',
                  lineHeight: '160%',
                }}
              >
                {aboutContent}
              </Box>
            </Box>

            <SidebarButton
              sx={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#2b2b2b',
                '&:hover': {
                  backgroundColor: '#ffffff1a',
                },
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              content={showMore ? 'Show Less' : 'Show More'}
              onClick={() => {
                setShowMore(!showMore);
              }}
            ></SidebarButton>
          </Box>
          <Box
            sx={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Box
                sx={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#919191',
                }}
              >
                Upcoming Events ({MOCK_DATA.upcomingEvents.length})
              </Box>
              <SidebarButton
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#e6e6e61a',
                  },
                  backgroundColor: 'transparent',
                  borderRadius: '10px',
                  opacity: 0.7,
                }}
                content="View All Events"
                rightIcon={<RightArrowCircleSmallIcon />}
              ></SidebarButton>
            </Box>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  boxSizing: 'border-box',
                  fontSize: '18px',
                  fontWeight: '600',
                  paddingLeft: '14px',
                  paddingRight: '14px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #ffffff1a',
                  borderRadius: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'sticky',
                  backdropFilter: 'blur(40px)',
                  top: '10px',
                  backgroundColor: '#222222cc',
                }}
              >
                October 2023
              </Box>
              <Box>
                {events.map((event, index) => (
                  <EventCard
                    id={event.id}
                    spaceId={event.spaceId}
                    key={`EventCard-${index}`}
                    name={event.title}
                    description={event.description}
                  />
                ))}
              </Box>
            </Box>
            <Box
              sx={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                {/*<Box
                  sx={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#919191',
                  }}
                >
                  Past Events ({MOCK_DATA.pastEvents.length})
                </Box>
                <SidebarButton
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#e6e6e61a',
                    },
                    backgroundColor: 'transparent',
                    borderRadius: '10px',
                    opacity: 0.7,
                  }}
                  content="See All"
                ></SidebarButton>*/}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
