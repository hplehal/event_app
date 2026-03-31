"use client";

import { EventBadge } from "@/components/events/EventBadge";
import { AddToCalendarButton } from "@/components/events/AddToCalendarButton";
import { Star, MapPin } from "lucide-react";
import { formatToronto } from "@/lib/utils";

interface FeaturedEvent {
  id: string;
  title: string;
  type: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
  _count?: { attendances: number };
}

interface FeaturedEventsProps {
  events: FeaturedEvent[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-500" />
        <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Featured For You</h2>
      </div>
      <p className="text-xs text-stone-400 mb-3">Based on sessions you've attended before</p>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="flex overflow-hidden rounded-xl border border-stone-200 bg-white hover:shadow-md hover:border-stone-300 transition-all">
            <div className="w-1.5 flex-shrink-0 bg-amber-400" />
            <div className="flex gap-3 p-3 flex-1 min-w-0">
              <div className="flex-shrink-0 text-center w-14">
                <p className="text-xs font-bold text-amber-600 uppercase">{formatToronto(new Date(e.startTime), "EEE")}</p>
                <p className="text-lg font-extrabold text-stone-900 leading-tight">{formatToronto(new Date(e.startTime), "d")}</p>
                <p className="text-[10px] text-stone-400">{formatToronto(new Date(e.startTime), "MMM")}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{e.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <EventBadge type={e.type} />
                  <span className="text-xs text-stone-400">
                    {formatToronto(new Date(e.startTime), "HH:mm")} – {formatToronto(new Date(e.endTime), "HH:mm")}
                  </span>
                </div>
                {e.location && (
                  <span className="flex items-center gap-1 text-xs text-stone-400 mt-1">
                    <MapPin size={10} />
                    {e.location}
                  </span>
                )}
                <div className="mt-2">
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
