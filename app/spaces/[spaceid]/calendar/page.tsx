'use client';
import React, { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Box, Stack } from '@mui/material';
import { useCeramicContext } from '@/context/CeramicContext';
import { Space } from '@/types';
import SubSidebar from 'components/layout/Sidebar/SubSidebar';

import Drawer from '@/components/drawer';
import { getSpaceEventsQuery } from '@/services/space';
import { useQuery } from '@tanstack/react-query';
import CreateEventForm from './components/CreateEventForm';

const Calendar = () => {
  const params = useParams();
  const spaceId = params.spaceid.toString();

  const [open, setOpen] = useState(true);

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
    toggleDrawer();
    refetch();
  }, [refetch, toggleDrawer]);

  return (
    <Stack direction="row" width={'100%'}>
      <SubSidebar
        title={spaceData?.name}
        spaceId={params.spaceid.toString()}
        avatar={spaceData?.avatar}
        banner={spaceData?.banner}
        isAdmin={true}
      />
      <Box width="100%" borderLeft="1px solid #383838">
        <Drawer open={open} onClose={toggleDrawer} onOpen={toggleDrawer}>
          <CreateEventForm spaceId={spaceId} handleClose={handleFormClose} />
        </Drawer>
      </Box>
    </Stack>
  );
};

export default Calendar;
