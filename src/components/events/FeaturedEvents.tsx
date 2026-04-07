"use client";

import { EventBadge } from "@/components/events/EventBadge";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { RsvpButton } from "@/components/events/RsvpButton";
import { Star, MapPin } from "lucide-react";
import { formatToronto } from "@/lib/utils";

interface FeaturedEvent {
  id: string;
  title: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
  capacity?: number | null;
  _count?: { attendances: number; rsvps?: number };
}

interface FeaturedEventsProps {
  events: FeaturedEvent[];
  rsvpIds?: string[];
}

export function FeaturedEvents({ events, rsvpIds = [] }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <Star size={13} className="text-amber-500" />
        Featured For You
      </h2>
      <p className="text-xs text-stone-400 mb-3">Based on sessions you've attended before</p>
      <div className="space-y-2">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-white border border-stone-200/60 rounded-2xl p-4 hover:shadow-md hover:shadow-stone-100 transition-all duration-200"
          >
            <div className="flex gap-3.5">
              {/* Date block */}
              <div className="flex-shrink-0 text-center w-12 pt-0.5">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  {formatToronto(new Date(e.startTime), "EEE")}
                </p>
                <p className="text-xl font-extrabold text-stone-900 leading-tight">
                  {formatToronto(new Date(e.startTime), "d")}
                </p>
                <p className="text-[10px] text-stone-400">
                  {formatToronto(new Date(e.startTime), "MMM")}
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{e.title}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <EventBadge type={e.type} />
                  <span className="text-[11px] text-stone-400">
                    {formatToronto(new Date(e.startTime), "HH:mm")} – {formatToronto(new Date(e.endTime), "HH:mm")}
                  </span>
                </div>
                {e.location && (
                  <span className="flex items-center gap-1 text-[11px] text-stone-400 mt-1">
                    <MapPin size={9} />
                    {e.location}
                  </span>
                )}
                <div className="mt-2.5 flex items-center gap-2">
                  <RsvpButton
                    eventId={e.id}
                    initialRsvped={rsvpIds.includes(e.id)}
                    initialCount={e._count?.rsvps ?? 0}
                    capacity={e.capacity}
                  />
                  <AddToCalendarButton event={e} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
