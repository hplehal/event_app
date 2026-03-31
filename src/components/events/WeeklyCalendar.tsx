"use client";

import { useState } from "react";
import { TORONTO_TZ } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addDays, startOfWeek, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface CalEvent {
  id: string;
  title: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
  _count?: { attendances: number };
}

interface WeeklyCalendarProps {
  events: CalEvent[];
  myAttendanceEventIds?: string[];
  onEventClick?: (event: any) => void;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8–21

const TYPE_COLORS: Record<string, string> = {
  VOLLEYBALL:  "bg-amber-100 text-amber-800 hover:bg-amber-200",
  BASKETBALL:  "bg-orange-100 text-orange-800 hover:bg-orange-200",
  TENNIS:      "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  SOCCER:      "bg-sky-100 text-sky-800 hover:bg-sky-200",
  TOURNAMENT:  "bg-red-100 text-red-800 hover:bg-red-200",
  LEAGUE:      "bg-purple-100 text-purple-800 hover:bg-purple-200",
  OPEN_COURT:  "bg-teal-100 text-teal-800 hover:bg-teal-200",
  OTHER:       "bg-stone-100 text-stone-700 hover:bg-stone-200",
};

const REGISTERED_COLORS: Record<string, string> = {
  VOLLEYBALL:  "bg-amber-500 text-white hover:bg-amber-600",
  BASKETBALL:  "bg-orange-500 text-white hover:bg-orange-600",
  TENNIS:      "bg-emerald-500 text-white hover:bg-emerald-600",
  SOCCER:      "bg-sky-500 text-white hover:bg-sky-600",
  TOURNAMENT:  "bg-red-500 text-white hover:bg-red-600",
  LEAGUE:      "bg-purple-500 text-white hover:bg-purple-600",
  OPEN_COURT:  "bg-teal-500 text-white hover:bg-teal-600",
  OTHER:       "bg-stone-500 text-white hover:bg-stone-600",
};

export function WeeklyCalendar({ events, myAttendanceEventIds = [], onEventClick }: WeeklyCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const now = toZonedTime(new Date(), TORONTO_TZ);
  const baseMonday = startOfWeek(now, { weekStartsOn: 1 });
  const monday = addDays(baseMonday, weekOffset * 7);
  const days = Array.from({ length: 6 }, (_, i) => addDays(monday, i));

  const weekLabel = `${format(monday, "MMM d")} – ${format(addDays(monday, 6), "MMM d, yyyy")}`;

  function getEventsForDayHour(day: Date, hour: number) {
    return events.filter((e) => {
      const start = toZonedTime(new Date(e.startTime), TORONTO_TZ);
      return (
        start.getFullYear() === day.getFullYear() &&
        start.getMonth() === day.getMonth() &&
        start.getDate() === day.getDate() &&
        start.getHours() === hour
      );
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <p className="text-sm font-medium text-stone-700">{weekLabel}</p>
        <Button variant="outline" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Calendar grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-7 border-b border-stone-200">
            <div className="p-2 text-xs text-stone-400 font-medium bg-white" />
            {days.map((day, i) => {
              const isToday =
                day.getFullYear() === now.getFullYear() &&
                day.getMonth() === now.getMonth() &&
                day.getDate() === now.getDate();
              return (
                <div key={i} className={`p-2 text-center ${isToday ? "bg-amber-50" : "bg-white"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-amber-600" : "text-stone-400"}`}>
                    {DAY_NAMES[i]}
                  </p>
                  <p className={`text-lg font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${
                    isToday ? "bg-amber-600 text-white" : "text-stone-800"
                  }`}>
                    {format(day, "d")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-7 border-b border-stone-100 last:border-0">
              <div className="p-1.5 text-xs text-stone-400 font-medium text-right pr-2 self-start pt-2">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {days.map((day, i) => {
                const isToday =
                  day.getFullYear() === now.getFullYear() &&
                  day.getMonth() === now.getMonth() &&
                  day.getDate() === now.getDate();
                const dayEvents = getEventsForDayHour(day, hour);
                return (
                  <div key={i} className={`p-1 min-h-[52px] flex flex-col gap-0.5 border-l border-stone-100 ${isToday ? "bg-amber-50/40" : ""}`}>
                    {dayEvents.map((e) => {
                      const registered = myAttendanceEventIds.includes(e.id);
                      const colorClass = registered
                        ? (REGISTERED_COLORS[e.type] ?? REGISTERED_COLORS.OTHER)
                        : (TYPE_COLORS[e.type] ?? TYPE_COLORS.OTHER);
                      return (
                        <button
                          key={e.id}
                          onClick={() => onEventClick?.(e)}
                          className={`text-left text-xs rounded px-1.5 py-1 truncate w-full transition-colors font-medium ${colorClass}`}
                          title={e.title}
                        >
                          {e.title.split(" - ")[0]}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" />Volleyball</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-200" />Basketball</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />Tennis</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-sky-100 border border-sky-200" />Soccer</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" />Tournament</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />League</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-100 border border-teal-200" />Open Court</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500" />Checked In</span>
      </div>
    </div>
  );
}
