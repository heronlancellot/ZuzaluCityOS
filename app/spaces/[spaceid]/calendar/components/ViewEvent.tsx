import {
  ArrowUpLeftIcon,
  Cog6Icon,
  LinkIcon,
  MapIcon,
  TicketIcon,
} from '@/components/icons';
import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs/AdapterDayjs';
import { ZuButton } from '@/components/core';
import FormHeader from '@/components/form/FormHeader';
import Image from 'next/image';
import { CalEvent } from '@/types';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dynamic from 'next/dynamic';

dayjs.extend(utc);
dayjs.extend(timezone);

const EditorPreview = dynamic(
  () => import('@/components/editor/EditorPreview'),
  {
    ssr: false,
  },
);

interface ViewEventProps {
  event: CalEvent;
  handleClose: () => void;
}

export default function ViewEvent({ event, handleClose }: ViewEventProps) {
  const dateContent = useMemo(() => {
    const { startDate, endDate, timezone } = event;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (start.isSame(end, 'day')) {
      return (
        <Stack direction="row" gap="10px" alignItems="center">
          <Typography
            fontSize={14}
            fontWeight={600}
            lineHeight={1.6}
            sx={{ opacity: 0.5 }}
          >
            {start.format('dddd, MMMM D')}
          </Typography>
          <Typography
            fontSize={14}
            lineHeight={1.6}
          >{`${start.format('h:mm A')} - ${end.format('h:mm A')}`}</Typography>
          <Typography fontSize={10} lineHeight={1.2} sx={{ opacity: 0.9 }}>
            {timezone ? dayjs().tz(timezone).format('z') : ''}
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack direction="row" gap="10px" alignItems="center">
        <Typography
          fontSize={14}
          fontWeight={600}
          lineHeight={1.6}
          sx={{ opacity: 0.5 }}
        >
          {start.format('dddd, MMMM D')}
        </Typography>
        <Typography
          fontSize={14}
          lineHeight={1.6}
        >{`${start.format('h:mm A')}`}</Typography>
        <Typography
          fontSize={14}
          fontWeight={600}
          lineHeight={1.6}
          sx={{ opacity: 0.5 }}
        >
          ~
        </Typography>
        <Typography
          fontSize={14}
          fontWeight={600}
          lineHeight={1.6}
          sx={{ opacity: 0.5 }}
        >
          {end.format('dddd, MMMM D')}
        </Typography>
        <Typography
          fontSize={14}
          lineHeight={1.6}
        >{`${end.format('h:mm A')}`}</Typography>
        <Typography fontSize={10} lineHeight={1.2} sx={{ opacity: 0.9 }}>
          {timezone ? dayjs().tz(timezone).format('z') : ''}
        </Typography>
      </Stack>
    );
  }, [event.startDate, event.timezone]);

  const creator = JSON.parse(event.creator);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1200 }}>
          <FormHeader title="View Event" handleClose={handleClose} />
        </Box>

        <Stack
          sx={{
            flex: 1,
            overflowY: 'scroll',
            padding: '20px',
            gap: '20px',
            paddingBottom: '120px',
          }}
        >
          <Stack
            padding="10px"
            bgcolor="#ffc77d1a"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            border="1px solid rgba(255, 199, 125, .1)"
            borderRadius={'8px'}
          >
            <Typography
              fontSize={'14px'}
              lineHeight={'160%'}
              color={'rgba(255, 199, 125, 1)'}
              fontWeight={600}
            >
              You are organizing this event
            </Typography>
            <ZuButton
              startIcon={<Cog6Icon size={5} color="currentColor" />}
              sx={{
                padding: '6px 10px',
                backgroundColor: 'rgba(255, 199, 125, 0.05)',
                gap: '10px',
                '& > span': {
                  margin: '0px',
                },
                color: 'rgba(255, 199, 125, 1)',
                fontSize: '14px',
                fontWeight: 600,
              }}
              onClick={() => {}}
            >
              Manage
            </ZuButton>
          </Stack>
          {event.imageUrl && (
            <Image
              src={event.imageUrl}
              alt="event"
              height={338}
              width={1200}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {dateContent}
          <Typography fontSize={20} fontWeight={700} lineHeight={1.2}>
            {event.title}
          </Typography>
          <Stack
            p="10px"
            bgcolor="rgba(255, 255, 255, 0.05)"
            borderRadius="10px"
            gap="10px"
          >
            {event.location && (
              <Stack direction="row" gap="6px" alignItems="center">
                <MapIcon size={4.5} style={{ opacity: 0.5 }} />
                <Typography
                  fontSize={13}
                  lineHeight={1.4}
                  sx={{ opacity: 0.8 }}
                >
                  {event.location}
                </Typography>
              </Stack>
            )}
            {event.link && (
              <Stack direction="row" gap="6px" alignItems="center">
                <LinkIcon size={4.5} style={{ opacity: 0.5 }} />
                <Link
                  href={event.link}
                  target="_blank"
                  fontSize={13}
                  lineHeight={1.4}
                  sx={{ opacity: 0.8 }}
                >
                  {event.link}
                </Link>
              </Stack>
            )}
          </Stack>
          <Stack direction="row" gap="10px" alignItems="center">
            <Typography fontSize={13} lineHeight={1.4} sx={{ opacity: 0.5 }}>
              By:
            </Typography>
            <Stack direction="row" gap="5px" alignItems="center">
              <Image
                src={creator.avatar}
                alt={creator.username}
                width={20}
                height={20}
                style={{ borderRadius: '50%' }}
              />
              <Typography fontSize={14} fontWeight={600} lineHeight={1.6}>
                {creator.username}
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          {event.description && (
            <EditorPreview collapsable={false} value={event.description} />
          )}
        </Stack>

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
          }}
        >
          <Stack
            p="20px"
            bgcolor="#222"
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
            gap="10px"
          >
            <Stack
              direction="row"
              gap="4px"
              alignItems="center"
              justifyContent="center"
            >
              <Typography fontSize={13} lineHeight={1.4} sx={{ opacity: 0.5 }}>
                Attending:
              </Typography>
              <Typography fontSize={13} lineHeight={1.4} sx={{ opacity: 0.8 }}>
                0
              </Typography>
            </Stack>
            <ZuButton
              sx={{
                color: '#fff',
                backgroundColor: '#383838',
                width: '100%',
              }}
              startIcon={<TicketIcon size={5} />}
              //   disabled={disabled}
              //   onClick={handleConfirm}
            >
              RSVP
            </ZuButton>
          </Stack>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
