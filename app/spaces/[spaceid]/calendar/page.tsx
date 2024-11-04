'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Stack, Typography } from '@mui/material';
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
import { PlusCircleIcon, PlusIcon } from '@/components/icons';
import { ConfigPanel } from '../adminevents/[eventid]/Tabs/Ticket/components/Common';
import CalendarConfigForm from './components/CalendarConfigForm';

const mockCalEvent: CalEvent = {
  title: 'Team Weekly Sync',
  description:
    '{"time":1729973857881,"blocks":[{"id":"aWGpkp8S4G","type":"paragraph","data":{"text":"This is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testis a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testis a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a testThis is a test"}}],"version":"2.29.1"}',
  imageUrl:
    'https://framerusercontent.com/images/MapDq7Vvn8BNPMgVHZVBMSpwI.png',
  isAllDay: false,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 60 * 60 * 100000).toISOString(),
  creator:
    '{"author":{"id":"did:pkh:eip155:534351:0xa90381616eebc94d89b11afde57b869705626968"},"avatar":"https://gateway.lighthouse.storage/ipfs/bafkreifeptmxt2cjfpvfqrj4dt4sr67i2ggrsmqnwy4v5ak2a55xjcim3a","id":"k2t6wzhkhabz37szump036t6a0x8b58fezhd7z6w0orzhblrn0r6wk5nengsi5","username":"Zed","myEvents":null}',
  timezone: 'America/Belize',
  format: 'online',
  link: 'https://meet.google.com/abc-defg-hij',
  location: 'Virtual Meeting Room',
  recurring: 'none',
};

const Calendar = () => {
  const params = useParams();
  const { ceramic } = useCeramicContext();
  const spaceId = params.spaceid.toString();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>('view');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const { composeClient } = useCeramicContext();

  const { data: spaceData, refetch } = useQuery({
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
      }) as CalendarConfig;
    }
    return null;
  }, [spaceData]);

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
      toggleDrawer();
    }
    refetch();
  }, [refetch, toggleDrawer, type]);

  const canAccessCalendar = isAdmin || isMember;

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
        {!calendarConfig && isAdmin ? (
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
        ) : null}
        {calendarConfig && canAccessCalendar ? (
          <>
            <Stack
              borderBottom="1px solid rgba(255, 255, 255, 0.1)"
              p="10px 16px"
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
            <CalendarView />
          </>
        ) : calendarConfig ? (
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
        ) : null}
        <Drawer open={open} onClose={toggleDrawer} onOpen={toggleDrawer}>
          {(type === 'create' || type === 'edit') && (
            <CreateEventForm
              editType={type}
              // event={mockCalEvent}
              handleClose={handleFormClose}
            />
          )}
          {type === 'view' && (
            <ViewEvent
              handleEdit={setType}
              event={mockCalEvent}
              handleClose={handleFormClose}
            />
          )}
          {type === 'config' && (
            <CalendarConfigForm handleClose={handleFormClose} />
          )}
        </Drawer>
      </Stack>
    </Stack>
  );
};

export default Calendar;
