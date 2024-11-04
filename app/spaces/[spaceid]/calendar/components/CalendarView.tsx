'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import './calendar.css';

interface CalendarProps {
  onEventClick?: (info: any) => void;
  onDateSelect?: (info: any) => void;
}

export default function CalendarView({
  onEventClick,
  onDateSelect,
}: CalendarProps) {
  const [events, setEvents] = useState([
    {
      title: '示例事件',
      start: new Date(),
    },
  ]);

  return (
    <div className="h-full w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        events={events}
        showNonCurrentDates={false}
        fixedWeekCount={false}
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
