import * as React from 'react';
import {
  Alert,
  Box,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ZuButton } from 'components/core';
import { LockIcon, MapIcon } from 'components/icons';
import { Event } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { convertDateStringFormat } from '@/utils';
import Link from 'next/link';
import CopyToClipboard from 'react-copy-to-clipboard';
import dynamic from 'next/dynamic';
import { deleteEvent } from 'services/event/deleteEvent';
import { useCeramicContext } from '@/context/CeramicContext';
import useGetShareLink from '@/hooks/useGetShareLink';
import Dialog from '@/app/spaces/components/Modal/Dialog';

const EditorPreview = dynamic(
  () => import('@/components/editor/EditorPreview'),
  {
    ssr: false,
  },
);

interface PropTypes {
  eventData?: Event;
  handleEditEvent: () => void;
}

const OverviewDetail = ({ eventData, handleEditEvent }: PropTypes) => {
  const params = useParams();
  const eventId = params.eventid.toString();
  const { breakpoints } = useTheme();
  const { ceramic, profile, composeClient } = useCeramicContext();
  const userDID = ceramic?.did?.parent.toString().toLowerCase() || '';
  const [showCopyToast, setShowCopyToast] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const router = useRouter();
  const adminDeleteEvent = async () => {
    const deleteEventInput = {
      eventId: eventId as string,
      userDID: userDID as string,
    };
    try {
      const response = await deleteEvent(deleteEventInput);
      if (response.status === 200) {
        router.push(`/spaces`);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const { shareUrl } = useGetShareLink({ id: eventId, name: eventData?.title });
  const url =
    shareUrl ||
    (typeof window !== 'undefined' && `${window.origin}/events/${eventId}`) ||
    '';

  return eventData ? (
    <Stack
      marginY={4}
      padding={2}
      direction="row"
      gap={2}
      bgcolor="#262626"
      borderRadius={3}
      position={'relative'}
      overflow={'hidden'}
      boxSizing={'content-box'}
      sx={{
        [breakpoints.down('md')]: {
          flexDirection: 'column',
          alignItems: 'center',
        },
      }}
    >
      <Dialog
        title="Are you sure you want to delete this event?"
        message="This action cannot be undone. (If you have questions, please contact the platform)"
        confirmText="Delete"
        showModal={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        onConfirm={() => {
          adminDeleteEvent();
          setShowModal(false);
        }}
      />
      <Box
        component="img"
        src={eventData.imageUrl ? eventData.imageUrl : '/12.webp'}
        borderRadius={3}
        height={320}
        width={320}
        sx={{
          zIndex: '1',
        }}
      />
      <Stack
        direction="column"
        flex={1}
        spacing={2}
        zIndex={'1'}
        sx={{
          width: '',
          [breakpoints.down('md')]: {
            width: '100%',
          },
        }}
      >
        <Stack direction="row" spacing={2}>
          <ZuButton
            sx={{ backgroundColor: '#2F4541', flex: 1 }}
            onClick={handleEditEvent}
          >
            Edit Event Details
          </ZuButton>
          <Link href={'/events/' + eventId}>
            <ZuButton sx={{ backgroundColor: '#2F4541', flex: 1 }}>
              View Event
            </ZuButton>
          </Link>
          <CopyToClipboard
            text={url}
            onCopy={() => {
              setShowCopyToast(true);
            }}
          >
            <ZuButton sx={{ backgroundColor: '#2F4541', flex: 1 }}>
              Share Event
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
            </ZuButton>
          </CopyToClipboard>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" color="white">
            BY:
          </Typography>
          <Box
            component="img"
            src={eventData.space?.avatar}
            height={18}
            width={18}
            borderRadius={40}
          />
          <Typography variant="bodyS" color="white">
            {eventData.space && eventData.space.name}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* <EventIcon /> */}
          <Typography variant="bodyM" color="white">
            {convertDateStringFormat(eventData.startTime)} -{' '}
            {convertDateStringFormat(eventData.endTime)}
          </Typography>
        </Stack>
        <Typography variant="subtitleLB" color="white">
          {eventData.title}
        </Typography>
        <EditorPreview
          value={eventData.description}
          collapsable={false}
          scrollHeight={300}
        />
        {eventData.timezone && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <MapIcon size={4} />
            <Typography variant="caption" color="white">
              {eventData.timezone}
            </Typography>
          </Stack>
        )}
        {eventData.status && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <MapIcon size={4} />
            <Typography variant="caption" color="white">
              {eventData.status}
            </Typography>
          </Stack>
        )}
        {eventData.space && eventData.space.gated && (
          <ZuButton
            startIcon={<LockIcon size={4} />}
            sx={{ backgroundColor: '#2F4541', maxWidth: '20%' }}
          >
            GATED
          </ZuButton>
        )}
        <Stack width="100%" spacing={'6px'}>
          <ZuButton
            sx={{ backgroundColor: '#2F4541', width: '100%' }}
            onClick={handleEditEvent}
          >
            Edit Event Details
          </ZuButton>
          <Stack direction="row" spacing={2}>
            <Link
              href={'/events/' + eventId}
              style={{
                flex: 1,
              }}
            >
              <ZuButton sx={{ backgroundColor: '#2F4541', width: '100%' }}>
                View Event
              </ZuButton>
            </Link>
            <ZuButton
              sx={{ backgroundColor: 'red', flex: 1 }}
              onClick={() => setShowModal(true)}
            >
              Delete Event
            </ZuButton>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <></>
  );
};

export default OverviewDetail;
