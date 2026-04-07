import { formatToronto } from "@/lib/utils";
import { EventBadge } from "./EventBadge";
import { MapPin, Users, CheckCircle, CalendarCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
  capacity?: number | null;
  _count?: { attendances: number; rsvps?: number };
}

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
  isRsvped?: boolean;
  isHappeningNow?: boolean;
  showAttendanceCount?: boolean;
  showRsvpCount?: boolean;
  onClick?: () => void;
  className?: string;
}

const TYPE_ACCENT: Record<string, string> = {
  VOLLEYBALL: "bg-amber-500",
  BASKETBALL: "bg-orange-500",
  TENNIS: "bg-emerald-500",
  SOCCER: "bg-sky-500",
  TOURNAMENT: "bg-red-500",
  LEAGUE: "bg-purple-500",
  OPEN_COURT: "bg-teal-500",
  OTHER: "bg-stone-400",
};

export function EventCard({
  event,
  isRegistered,
  isRsvped,
  isHappeningNow,
  showAttendanceCount,
  showRsvpCount,
  onClick,
  className,
}: EventCardProps) {
  const start = formatToronto(new Date(event.startTime), "HH:mm");
  const end = formatToronto(new Date(event.endTime), "HH:mm");
  const accent = TYPE_ACCENT[event.type] ?? TYPE_ACCENT.OTHER;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex overflow-hidden rounded-2xl border bg-white transition-all duration-200 group",
        isHappeningNow && "ring-2 ring-green-400/60 border-green-200 shadow-sm shadow-green-100",
        isRegistered && !isHappeningNow && "border-emerald-200 bg-emerald-50/30",
        isRsvped && !isRegistered && !isHappeningNow && "border-amber-200 bg-amber-50/30",
        !isHappeningNow && !isRegistered && !isRsvped && "border-stone-200/60 hover:border-stone-300 hover:shadow-md hover:shadow-stone-100",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Color accent bar */}
      <div className={cn("w-1 flex-shrink-0 rounded-l-2xl", accent)} />

      {/* Content */}
      <div className="flex gap-3 p-3.5 flex-1 min-w-0">
        {/* Time column */}
        <div className="flex-shrink-0 text-right w-12">
          <p className="text-sm font-bold text-stone-800 tabular-nums">{start}</p>
          <p className="text-[11px] text-stone-400 tabular-nums">{end}</p>
        </div>

        {/* Divider */}
        <div className="w-px bg-stone-100 self-stretch my-0.5" />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-stone-900 leading-tight truncate">{event.title}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isRsvped && !isRegistered && (
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <CalendarCheck size={12} className="text-amber-600" />
                </div>
              )}
              {isRegistered && (
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={12} className="text-emerald-600" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <EventBadge type={event.type} />
            {event.location && (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <MapPin size={10} />
                {event.location}
              </span>
            )}
            {showAttendanceCount && event._count !== undefined && (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Users size={10} />
                {event._count.attendances}
              </span>
            )}
            {showRsvpCount && event._count?.rsvps != null && (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Ticket size={10} />
                {event._count.rsvps}{event.capacity ? `/${event.capacity}` : ""}
              </span>
            )}
            {!showRsvpCount && event.capacity != null && (
              <span className="flex items-center gap-1 text-[11px] text-stone-400">
                <Ticket size={10} />
                {event.capacity} spots
              </span>
            )}
          </div>
          {isHappeningNow && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Now
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
