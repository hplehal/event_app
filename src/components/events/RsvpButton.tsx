"use client";

import { useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RsvpButtonProps {
  eventId: string;
  initialRsvped: boolean;
  initialCount: number;
  capacity?: number | null;
  eventEnded?: boolean;
}

export function RsvpButton({ eventId, initialRsvped, initialCount, capacity, eventEnded }: RsvpButtonProps) {
  const [rsvped, setRsvped] = useState(initialRsvped);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const isFull = capacity != null && count >= capacity && !rsvped;

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      setRsvped(data.rsvped);
      setCount(data.rsvpCount);
      toast.success(data.rsvped ? "You're in! RSVP confirmed." : "RSVP cancelled.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (eventEnded) {
    return null;
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      disabled={loading || isFull}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        rsvped
          ? "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.97]"
          : isFull
            ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 active:scale-[0.97]"
      }`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <CalendarCheck size={13} />
      )}
      {rsvped ? "RSVP'd" : isFull ? "Full" : "RSVP"}
      {capacity != null && (
        <span className="text-[10px] opacity-70 ml-0.5">
          {count}/{capacity}
        </span>
      )}
    </button>
  );
}
