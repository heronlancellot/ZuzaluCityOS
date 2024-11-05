'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './calendar.css';

interface CalendarProps {
  eventsData: any[];
  onEventClick?: (id: any) => void;
}

export default function CalendarView({
  eventsData,
  onEventClick,
}: CalendarProps) {
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
          const eventId = info.event.id;
          onEventClick?.(eventId);
        }}
      />
    </div>
  );
}
