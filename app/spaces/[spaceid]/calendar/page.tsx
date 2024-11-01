'use client';
import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Box, Stack } from '@mui/material';
import { useCeramicContext } from '@/context/CeramicContext';
import { CalEvent, Space } from '@/types';
import SubSidebar from 'components/layout/Sidebar/SubSidebar';
import Drawer from '@/components/drawer';
import { getSpaceEventsQuery } from '@/services/space';
import { useQuery } from '@tanstack/react-query';
import ViewEvent from './components/ViewEvent';
import { useDialog } from '@/components/dialog/DialogContext';
import CreateEventForm from './components/CreateEventForm';

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
  const spaceId = params.spaceid.toString();

  const [open, setOpen] = useState(true);
  const [type, setType] = useState<string>('view');

  const { composeClient } = useCeramicContext();

  const { data: spaceData, refetch } = useQuery({
    queryKey: ['getSpaceByID', spaceId],
    queryFn: () => {
      return composeClient.executeQuery(getSpaceEventsQuery(), {
        id: spaceId,
      });
    },
    select: (data) => {
      return data?.data?.node as Space;
    },
  });

  const toggleDrawer = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleFormClose = useCallback(() => {
    if (type.includes('edit')) {
      setType('view');
    } else {
      setType('');
      toggleDrawer();
    }
    refetch();
  }, [refetch, toggleDrawer, type]);

  return (
    <Stack direction="row" width={'100%'}>
      <SubSidebar
        title={spaceData?.name}
        spaceId={params.spaceid.toString()}
        avatar={spaceData?.avatar}
        banner={spaceData?.banner}
        isAdmin={true}
      />
      <Drawer open={open} onClose={toggleDrawer} onOpen={toggleDrawer}>
        {type && type !== 'view' && (
          <CreateEventForm
            editType={type}
            event={mockCalEvent}
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
      </Drawer>
    </Stack>
  );
};

export default Calendar;
