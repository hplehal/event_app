"use client";

import { useEffect, useState } from "react";
import { formatToronto, TORONTO_TZ } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import { Clock } from "lucide-react";

export function TorontoClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const toronto = toZonedTime(now, TORONTO_TZ);
  const time = formatToronto(toronto, "HH:mm:ss");
  const date = formatToronto(toronto, "EEEE, MMM d");

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-stone-900 to-stone-800 text-white px-5 py-3 rounded-2xl shadow-lg shadow-stone-900/20">
      <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
        <Clock size={18} className="text-amber-400" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums leading-none tracking-tight">{time}</p>
        <p className="text-stone-400 text-xs mt-0.5">{date} — Toronto</p>
      </div>
    </div>
  );
}
