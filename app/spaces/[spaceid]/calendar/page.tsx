'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useCeramicContext } from '@/context/CeramicContext';
import { CalendarConfig, CalEvent, Space } from '@/types';
import SubSidebar from 'components/layout/Sidebar/SubSidebar';
import Drawer from '@/components/drawer';
import { getSpaceEventsQuery } from '@/services/space';
import { useQuery } from '@tanstack/react-query';
import ViewEvent from './components/ViewEvent';
import CreateEventForm from './components/CreateEventForm';
import CalendarView from './components/CalendarView';
import { ZuButton } from '@/components/core';
import dayjs from 'dayjs';
import { PlusCircleIcon } from '@/components/icons';
import { ConfigPanel } from '../adminevents/[eventid]/Tabs/Ticket/components/Common';
import CalendarConfigForm from './components/CalendarConfigForm';
import { supabase } from '@/utils/supabase/client';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const Calendar = () => {
  const params = useParams();
  const { ceramic } = useCeramicContext();
  const spaceId = params.spaceid.toString();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  const { composeClient } = useCeramicContext();

  const {
    data: spaceData,
    refetch: refetchSpace,
    isLoading: isLoadingSpace,
  } = useQuery({
    queryKey: ['getSpaceByID', spaceId],
    queryFn: () => {
      return composeClient.executeQuery(getSpaceEventsQuery(), {
        id: spaceId,
      });
    },
    select: (data) => {
      const space = data?.data?.node as Space;
      return space;
    },
  });

  useEffect(() => {
    if (spaceData) {
      const admins =
        spaceData?.admins?.map((admin) => admin.id.toLowerCase()) || [];
      const superAdmins =
        spaceData?.superAdmin?.map((superAdmin) =>
          superAdmin.id.toLowerCase(),
        ) || [];
      const members =
        spaceData?.members?.map((member) => member.id.toLowerCase()) || [];
      const userDID = ceramic?.did?.parent.toString().toLowerCase() || '';
      if (admins.includes(userDID) || superAdmins.includes(userDID)) {
        setIsAdmin(true);
      }
      if (members.includes(userDID)) {
        setIsMember(true);
      }
    }
  }, [spaceData]);

  const calendarConfig = useMemo(() => {
    if (spaceData && spaceData.customAttributes) {
      const tbd = spaceData.customAttributes.map((item) =>
        JSON.parse(item.tbd),
      );
      return tbd.find((item) => {
        if (item.key === 'calendarConfig') {
          return item.value;
        }
      })?.value as CalendarConfig;
    }
    return null;
  }, [spaceData]);

  const canAccessCalendar = isAdmin || isMember;

  const { data: eventsData, refetch: refetchEvents } = useQuery({
    queryKey: ['calendar', spaceId],
    queryFn: () => {
      return supabase.from('sideEvents').select('*').eq('space_id', spaceId);
    },
    select: (data: any) => {
      return data.data;
    },
    enabled: !!calendarConfig && canAccessCalendar,
  });

  const filteredEventsData = useMemo(() => {
    if (!eventsData) return [];
    const data = eventsData.map((event: any) => {
      const { start_date, end_date, timezone, id, category, name } = event;
      return {
        title: name,
        start: dayjs.tz(dayjs(start_date), timezone).toISOString(),
        end: dayjs.tz(dayjs(end_date), timezone).toISOString(),
        id,
        category: category.split(','),
      };
    });
    if (currentCategory === 'All') {
      return data;
    }
    return data.filter((event: any) =>
      event.category.includes(currentCategory),
    );
  }, [eventsData, currentCategory]);

  const toggleDrawer = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleType = useCallback(
    (type: string) => {
      setType(type);
      toggleDrawer();
    },
    [toggleDrawer],
  );

  const handleFormClose = useCallback(() => {
    if (type.includes('edit')) {
      setType('view');
    } else {
      setType('');
      setCurrentEvent(null);
      toggleDrawer();
    }
  }, [toggleDrawer, type]);

  const handleCategory = useCallback((category: string) => {
    setCurrentCategory(category);
  }, []);

  const handleEventClick = useCallback(
    (id: any) => {
      toggleDrawer();
      setType('view');
      eventsData?.forEach((event: any) => {
        if (event.id === Number(id)) {
          setCurrentEvent(event);
        }
      });
    },
    [eventsData, toggleDrawer],
  );

  const content = useMemo(() => {
    if (isLoadingSpace) {
      return (
        <CircularProgress
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
          }}
        />
      );
    }
    if (!calendarConfig && isAdmin) {
      return (
        <ConfigPanel
          title="Configure Space Calendar"
          desc="You need to setup initial configurations"
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(44, 44, 44, 0.80)',
            width: '600px',
            position: 'absolute',
            top: '40%',
            left: '50%',
            zIndex: 1200,
            transform: 'translate(-50%, -50%)',
          }}
          handleOpen={() => handleType('config')}
        />
      );
    }
    if (calendarConfig && canAccessCalendar) {
      return (
        <>
          <Stack
            p="10px 20px"
            bgcolor="#2E2E2E"
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            height="60px"
            justifyContent="center"
          >
            <Typography fontSize={20} fontWeight={700} lineHeight={1.2}>
              {calendarConfig.name}
            </Typography>
          </Stack>
          <Stack
            borderBottom="1px solid rgba(255, 255, 255, 0.1)"
            p="10px 20px"
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              fontSize={16}
              fontWeight={700}
              lineHeight={1.2}
              sx={{ opacity: 0.8 }}
            >
              {dayjs().format('MMMM YYYY')}
            </Typography>
            <ZuButton
              endIcon={<PlusCircleIcon size={4} />}
              onClick={() => handleType('create')}
            >
              Add event
            </ZuButton>
          </Stack>
          <Stack
            p="10px"
            direction="row"
            gap="10px"
            flexWrap="wrap"
            alignItems="center"
          >
            {['All', ...calendarConfig.category.split(',')].map((item) => (
              <Box
                key={item}
                sx={{
                  bgcolor:
                    currentCategory === item
                      ? 'rgba(255, 255, 255, 0.20)'
                      : 'rgba(255, 255, 255, 0.10)',
                  p: '4px 10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.30)',
                  },
                }}
                onClick={() => handleCategory(item)}
              >
                <Typography
                  fontSize={13}
                  lineHeight={1.4}
                  sx={{ opacity: 0.8 }}
                >
                  #{item}
                </Typography>
              </Box>
            ))}
          </Stack>
          <CalendarView
            eventsData={filteredEventsData}
            onEventClick={handleEventClick}
          />
        </>
      );
    }
    return (
      <ConfigPanel
        title="Calendar"
        desc="You don't have access to this calendar"
        needButton={false}
        sx={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(44, 44, 44, 0.80)',
          width: '600px',
          position: 'absolute',
          top: '40%',
          left: '50%',
          zIndex: 1200,
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  }, [
    isLoadingSpace,
    calendarConfig,
    isAdmin,
    canAccessCalendar,
    handleType,
    filteredEventsData,
    handleEventClick,
    currentCategory,
    handleCategory,
  ]);

  return (
    <Stack direction="row" width={'100%'}>
      <SubSidebar
        title={spaceData?.name}
        spaceId={params.spaceid.toString()}
        avatar={spaceData?.avatar}
        banner={spaceData?.banner}
        isAdmin={true}
      />
      <Stack width="100%" position="relative">
        {content}
        <Drawer open={open} onClose={toggleDrawer} onOpen={toggleDrawer}>
          {(type === 'create' || type === 'edit') && (
            <CreateEventForm
              editType={type}
              spaceId={spaceId}
              categories={calendarConfig?.category.split(',') || []}
              event={currentEvent}
              handleClose={handleFormClose}
              refetch={refetchEvents}
            />
          )}
          {type === 'view' && (
            <ViewEvent
              handleEdit={setType}
              event={currentEvent}
              handleClose={handleFormClose}
            />
          )}
          {type === 'config' && (
            <CalendarConfigForm
              space={spaceData!}
              handleClose={handleFormClose}
              refetch={refetchSpace}
            />
          )}
        </Drawer>
      </Stack>
    </Stack>
  );
};

export default Calendar;
