'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './calendar.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import dayjs from 'dayjs';

interface CalendarProps {
  spaceId: string;
  onEventClick?: (info: any) => void;
  onDateSelect?: (info: any) => void;
}

export default function CalendarView({
  spaceId,
  onEventClick,
  onDateSelect,
}: CalendarProps) {
  const { data: eventsData } = useQuery({
    queryKey: ['calendar', spaceId],
    queryFn: () => {
      return supabase.from('sideEvents').select('*').eq('space_id', spaceId);
    },
    select: (data: any) => {
      if (data.data) {
        return data.data.map((event: any) => {
          return {
            title: event.name,
            start: dayjs(event.start_date).tz(event.timezone).toISOString(),
            end: dayjs(event.end_date).tz(event.timezone).toISOString(),
            id: event.id,
          };
        });
      }
      return [];
    },
  });

  return (
    <div className="h-full w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        events={eventsData}
        showNonCurrentDates={false}
        fixedWeekCount={false}
        dayMaxEvents={4}
        aspectRatio={2}
        eventClick={(info) => {
          onEventClick?.(info);
        }}
        select={(info) => {
          onDateSelect?.(info);
        }}
      />
    </div>
  );
}
