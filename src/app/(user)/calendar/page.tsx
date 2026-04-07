"use client";

import { useEffect, useState } from "react";
import { WeeklyCalendar } from "@/components/events/WeeklyCalendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventBadge } from "@/components/events/EventBadge";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { RsvpButton } from "@/components/events/RsvpButton";
import { MapPin, Clock, Users, Ticket, CalendarDays } from "lucide-react";
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
    <div className="px-4 md:px-6 py-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <CalendarDays size={22} className="text-amber-500" />
          Calendar
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">Weekly view of all court sessions and events</p>
      </div>

      <WeeklyCalendar
        events={events}
        myAttendanceEventIds={myAttendanceIds}
        onEventClick={setSelectedEvent}
      />

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-start gap-2 pr-4">
                <span className="leading-tight">{selectedEvent.title.split(" - ")[0]}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <EventBadge type={selectedEvent.type} />
                {myAttendanceIds.includes(selectedEvent.id) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Checked In
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                  <Clock size={13} className="text-stone-500" />
                </div>
                {formatToronto(new Date(selectedEvent.startTime), "EEEE, MMM d · HH:mm")} –{" "}
                {formatToronto(new Date(selectedEvent.endTime), "HH:mm")}
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                    <MapPin size={13} className="text-stone-500" />
                  </div>
                  {selectedEvent.location}
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Users size={13} className="text-emerald-600" />
                  </div>
                  <span>{selectedEvent._count.attendances} checked in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Ticket size={13} className="text-purple-600" />
                  </div>
                  <span>
                    {selectedEvent._count.rsvps} RSVP'd
                    {selectedEvent.capacity && ` / ${selectedEvent.capacity}`}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
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
