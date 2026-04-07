"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { downloadICS, generateGoogleCalendarURL } from "@/lib/calendar-export";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    location?: string | null;
    type?: string;
  };
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const calEvent = {
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    description: event.type ? `${event.type} session at Tito's Courts` : undefined,
  };

  function handleICS() {
    downloadICS(calEvent);
    setOpen(false);
  }

  function handleGoogle() {
    window.open(generateGoogleCalendarURL(calEvent), "_blank");
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-stone-50 text-stone-600 border border-stone-200/60 hover:bg-stone-100 hover:text-stone-800 transition-colors"
      >
        <CalendarPlus size={13} />
        Calendar
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 left-0 w-52 bg-white border border-stone-200/60 rounded-2xl shadow-lg shadow-stone-200/40 overflow-hidden">
          <button
            onClick={handleGoogle}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="flex-shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="font-medium text-xs">Google Calendar</p>
              <p className="text-[10px] text-stone-400">Opens in new tab</p>
            </div>
            <ExternalLink size={10} className="ml-auto text-stone-300" />
          </button>

          <div className="border-t border-stone-100" />

          <button
            onClick={handleICS}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
          >
            <CalendarPlus size={16} className="flex-shrink-0 text-stone-400" />
            <div>
              <p className="font-medium text-xs">Apple / Outlook</p>
              <p className="text-[10px] text-stone-400">Download .ics file</p>
            </div>
            <Download size={10} className="ml-auto text-stone-300" />
          </button>
        </div>
      )}
    </div>
  );
}
