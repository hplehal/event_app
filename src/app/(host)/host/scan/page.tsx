"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { ManualCodeInput } from "@/components/scan/ManualCodeInput";
import { ScanResult } from "@/components/scan/ScanResult";
import { EventBadge } from "@/components/events/EventBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatToronto, TORONTO_TZ } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { ScanLine, Keyboard, Camera, ChevronDown, Users, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const QRScanner = dynamic(
  () => import("@/components/scan/QRScanner").then((m) => m.QRScanner),
  { ssr: false }
);

interface Event {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  capacity?: number | null;
  _count?: { attendances: number; rsvps: number };
}

type ScanResultData = {
  type: "success" | "error" | "overlap" | "too-early";
  message: string;
  user?: { name: string; email: string; image?: string | null };
  event?: { title: string; startTime: string };
};

export default function ScanPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [showEventList, setShowEventList] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResultData | null>(null);

  useEffect(() => {
    const toronto = toZonedTime(new Date(), TORONTO_TZ);
    const dateStr = format(toronto, "yyyy-MM-dd");
    fetch(`/api/events?date=${dateStr}`)
      .then((r) => r.json())
      .then((data) => {
        setEvents(data);
        if (data.length === 1) {
          setSelectedEventId(data[0].id);
        } else {
          const now = new Date();
          const happening = data.find(
            (e: Event) => new Date(e.startTime) <= now && new Date(e.endTime) >= now
          );
          if (happening) setSelectedEventId(happening.id);
          else setShowEventList(true);
        }
      });
  }, []);

  const handleScan = useCallback(
    async (qrCode: string) => {
      if (!selectedEventId) return;
      setScanning(true);
      try {
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrCode, eventId: selectedEventId }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult({ type: "success", message: "Attendance registered!", user: data.user, event: data.event });
          const toronto = toZonedTime(new Date(), TORONTO_TZ);
          const dateStr = format(toronto, "yyyy-MM-dd");
          fetch(`/api/events?date=${dateStr}`).then((r) => r.json()).then(setEvents);
        } else {
          const type = data.code === "OVERLAP_CONFLICT" ? "overlap" : data.code === "TOO_EARLY" ? "too-early" : "error";
          setResult({ type, message: data.error ?? "Registration failed." });
        }
      } finally {
        setScanning(false);
      }
    },
    [selectedEventId]
  );

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const now = new Date();

  return (
    <div className="max-w-lg space-y-3">
      {/* Page header */}
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Scan</h1>
        <p className="text-stone-500 text-sm mt-0.5">Check in players for today's sessions</p>
      </div>

      {/* Event selector */}
      <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowEventList((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left"
        >
          <div className="min-w-0 flex-1">
            {selectedEvent ? (
              <>
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mb-0.5">Scanning for</p>
                <p className="font-semibold text-stone-900 text-sm truncate">
                  {selectedEvent.title.split(" - ")[0]}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {formatToronto(new Date(selectedEvent.startTime), "HH:mm")}–
                  {formatToronto(new Date(selectedEvent.endTime), "HH:mm")}
                  {selectedEvent.location ? ` · ${selectedEvent.location}` : ""}
                </p>
              </>
            ) : (
              <p className="text-stone-400 text-sm">Tap to select an event</p>
            )}
          </div>
          {/* Seat availability */}
          {selectedEvent?._count && (
            <div className="flex flex-col items-end gap-0.5 shrink-0 mr-2">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <Users size={10} />
                {selectedEvent._count.attendances} in
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <Ticket size={10} />
                {selectedEvent._count.rsvps} RSVP
              </div>
              {selectedEvent.capacity != null && (() => {
                const spotsLeft = selectedEvent.capacity! - selectedEvent._count!.attendances;
                return (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    spotsLeft <= 0 ? "bg-red-50 text-red-600" :
                    spotsLeft <= 3 ? "bg-amber-50 text-amber-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {spotsLeft <= 0 ? "FULL" : `${spotsLeft} left`}
                  </span>
                );
              })()}
            </div>
          )}
          <div className="flex items-center gap-2 shrink-0 ml-1">
            {selectedEvent && <EventBadge type={selectedEvent.type} />}
            <ChevronDown size={14} className={cn("text-stone-400 transition-transform", showEventList && "rotate-180")} />
          </div>
        </button>

        {/* Expandable event list */}
        {showEventList && (
          <div className="border-t border-stone-100 max-h-52 overflow-y-auto scrollbar-thin">
            {events.length === 0 ? (
              <p className="text-center py-6 text-stone-400 text-sm">No events today</p>
            ) : (
              events.map((e) => {
                const isNow = new Date(e.startTime) <= now && new Date(e.endTime) >= now;
                return (
                  <button
                    key={e.id}
                    onClick={() => { setSelectedEventId(e.id); setShowEventList(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-stone-50 border-b border-stone-50 last:border-0 transition-colors",
                      selectedEventId === e.id && "bg-amber-50/50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-sm text-stone-800 truncate font-medium block">{e.title.split(" - ")[0]}</span>
                      {e._count && (
                        <span className="text-[10px] text-stone-400">
                          {e._count.attendances} checked in · {e._count.rsvps} RSVP'd
                          {e.capacity != null && (() => {
                            const left = e.capacity! - e._count!.attendances;
                            return left <= 0 ? " · Full" : ` · ${left} spots left`;
                          })()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isNow && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                      <span className="text-[11px] text-stone-400 tabular-nums">{formatToronto(new Date(e.startTime), "HH:mm")}</span>
                      <EventBadge type={e.type} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <ScanResult
          type={result.type}
          message={result.message}
          user={result.user}
          event={result.event}
          onDismiss={() => setResult(null)}
        />
      )}

      {/* Scanner */}
      <div className="bg-white border border-stone-200/60 rounded-2xl p-4">
        <Tabs defaultValue="camera">
          <TabsList className="mb-3 w-full rounded-xl">
            <TabsTrigger value="camera" className="flex-1 gap-1.5 rounded-lg text-xs">
              <Camera size={13} /> Camera
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 gap-1.5 rounded-lg text-xs">
              <Keyboard size={13} /> Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="camera">
            {selectedEventId ? (
              <QRScanner onScan={handleScan} active={!scanning} />
            ) : (
              <div className="flex items-center justify-center h-48 text-stone-400 text-sm border border-dashed border-stone-200/60 rounded-xl">
                <div className="text-center">
                  <ScanLine size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Select an event above</p>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="manual">
            <ManualCodeInput onScan={handleScan} disabled={scanning || !selectedEventId} />
            {!selectedEventId && (
              <p className="text-[11px] text-stone-400 mt-2">Select an event above to enable</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
