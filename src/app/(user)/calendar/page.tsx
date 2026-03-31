"use client";

import { useEffect, useState } from "react";
import { WeeklyCalendar } from "@/components/events/WeeklyCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventBadge } from "@/components/events/EventBadge";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { RsvpButton } from "@/components/events/RsvpButton";
import { MapPin, Clock, Users, Ticket } from "lucide-react";
import { formatToronto, TORONTO_TZ } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import { format, startOfWeek, addDays } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  capacity?: number | null;
  _count: { attendances: number; rsvps: number };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [myAttendanceIds, setMyAttendanceIds] = useState<string[]>([]);
  const [myRsvpIds, setMyRsvpIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const now = toZonedTime(new Date(), TORONTO_TZ);
    const monday = startOfWeek(now, { weekStartsOn: 1 });
    const weekMonday = addDays(monday, weekOffset * 7);
    const weekStr = format(weekMonday, "yyyy-MM-dd");

    Promise.all([
      fetch(`/api/events?week=${weekStr}`).then((r) => r.json()),
      fetch("/api/attendance/my").then((r) => r.json()),
      fetch("/api/rsvp/my").then((r) => r.json()),
    ]).then(([evs, att, rsvpIds]) => {
      setEvents(evs);
      setMyAttendanceIds(att.map((a: any) => a.eventId));
      setMyRsvpIds(rsvpIds);
    });
  }, [weekOffset]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Calendar</h1>
        <p className="text-stone-500 text-sm">Weekly view of all court sessions and events</p>
      </div>

      <WeeklyCalendar
        events={events}
        myAttendanceEventIds={myAttendanceIds}
        onEventClick={setSelectedEvent}
      />

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-start gap-2 pr-4">
                <span className="leading-tight">{selectedEvent.title.split(" - ")[0]}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <EventBadge type={selectedEvent.type} />
                {myAttendanceIds.includes(selectedEvent.id) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    Checked In
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock size={14} />
                {formatToronto(new Date(selectedEvent.startTime), "EEEE, MMM d · HH:mm")} –{" "}
                {formatToronto(new Date(selectedEvent.endTime), "HH:mm")}
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <MapPin size={14} />
                  {selectedEvent.location}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Users size={14} />
                {selectedEvent._count.attendances} checked in
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Ticket size={14} />
                {selectedEvent._count.rsvps} RSVP'd
                {selectedEvent.capacity && ` / ${selectedEvent.capacity} spots`}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                <RsvpButton
                  eventId={selectedEvent.id}
                  initialRsvped={myRsvpIds.includes(selectedEvent.id)}
                  initialCount={selectedEvent._count.rsvps}
                  capacity={selectedEvent.capacity}
                  eventEnded={new Date(selectedEvent.endTime) < new Date()}
                />
                <AddToCalendarButton event={selectedEvent} />
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
