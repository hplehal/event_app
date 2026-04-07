"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Upload, ChevronLeft, ChevronRight, Pencil, Users, Ticket, UserX, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TORONTO_TZ, EVENT_TYPES, EVENT_TYPE_LABELS, formatToronto } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  capacity?: number | null;
  _count: { attendances: number; rsvps: number };
}

interface EventDetail extends Event {
  attendances?: { id: string; scannedAt: string; user: { id: string; name: string; email: string; image?: string | null } }[];
  rsvps?: { id: string; createdAt: string; user: { id: string; name: string; email: string; image?: string | null } }[];
}

function todayStr() {
  const t = toZonedTime(new Date(), TORONTO_TZ);
  return format(t, "yyyy-MM-dd");
}

export default function HostEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [dateStr, setDateStr] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "VOLLEYBALL", description: "", startTime: "", endTime: "", location: "", capacity: "",
  });

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "", title: "", type: "VOLLEYBALL", startTime: "", endTime: "", location: "", capacity: "",
  });
  const [saving, setSaving] = useState(false);

  const [selectedDetail, setSelectedDetail] = useState<EventDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [droppingUser, setDroppingUser] = useState<string | null>(null);

  function refreshEvents() {
    const params = new URLSearchParams({ date: dateStr });
    if (filterType !== "ALL") params.set("type", filterType);
    fetch(`/api/events?${params}`).then((r) => r.json()).then(setEvents);
  }

  useEffect(() => {
    if (!dateStr) {
      setDateStr(todayStr());
      return;
    }
    refreshEvents();
  }, [dateStr, filterType]);

  function prevDay() {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    setDateStr(format(d, "yyyy-MM-dd"));
  }
  function nextDay() {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    setDateStr(format(d, "yyyy-MM-dd"));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          description: form.description,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          location: form.location,
          capacity: form.capacity ? parseInt(form.capacity, 10) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Failed to create event.");
        return;
      }
      toast.success("Event created successfully.");
      setShowCreate(false);
      setForm({ title: "", type: "VOLLEYBALL", description: "", startTime: "", endTime: "", location: "", capacity: "" });
      refreshEvents();
    } finally {
      setCreating(false);
    }
  }

  function openEdit(ev: Event) {
    const start = toZonedTime(new Date(ev.startTime), TORONTO_TZ);
    const end = toZonedTime(new Date(ev.endTime), TORONTO_TZ);
    setEditForm({
      id: ev.id,
      title: ev.title,
      type: ev.type,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      location: ev.location ?? "",
      capacity: ev.capacity != null ? String(ev.capacity) : "",
    });
    setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          type: editForm.type,
          startTime: new Date(editForm.startTime).toISOString(),
          endTime: new Date(editForm.endTime).toISOString(),
          location: editForm.location || null,
          capacity: editForm.capacity ? parseInt(editForm.capacity, 10) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Failed to update event.");
        return;
      }
      toast.success("Event updated.");
      setShowEdit(false);
      refreshEvents();
    } finally {
      setSaving(false);
    }
  }

  async function openEventDetail(ev: Event) {
    setLoadingDetail(true);
    setSelectedDetail(null);
    try {
      const res = await fetch(`/api/events/${ev.id}`);
      const data = await res.json();
      setSelectedDetail(data);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function dropRsvp(userId: string) {
    if (!selectedDetail) return;
    setDroppingUser(userId);
    try {
      const res = await fetch("/api/rsvp/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, eventId: selectedDetail.id }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error ?? "Failed to drop player.");
        return;
      }
      toast.success("Player RSVP removed.");
      const refreshed = await fetch(`/api/events/${selectedDetail.id}`).then((r) => r.json());
      setSelectedDetail(refreshed);
      refreshEvents();
    } finally {
      setDroppingUser(null);
    }
  }

  if (!dateStr) return null;

  const displayDate = new Date(dateStr + "T12:00:00");
  const attendedUserIds = new Set(selectedDetail?.attendances?.map((a) => a.user.id) ?? []);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Events</h1>
          <p className="text-stone-500 text-sm mt-0.5">Manage and view court sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled className="gap-2 opacity-50 hidden sm:flex rounded-xl text-xs">
            <Upload size={14} />
            Import XLSX
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2 rounded-xl">
            <Plus size={14} />
            New Event
          </Button>
        </div>
      </div>

      {/* Date navigator + type filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-stone-200/60 rounded-xl px-2 py-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={prevDay}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[130px] text-center text-stone-700">
            {format(displayDate, "EEE, MMM d yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={nextDay}>
            <ChevronRight size={14} />
          </Button>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs border border-stone-200/60 rounded-xl px-3 py-2 bg-white text-stone-700"
        >
          <option value="ALL">All Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm bg-white rounded-2xl border border-stone-200/60">
          No sessions scheduled for this date.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0" onClick={() => openEventDetail(e)}>
                <EventCard event={e} showAttendanceCount showRsvpCount onClick={() => {}} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-400 hover:text-amber-600 shrink-0 rounded-lg"
                onClick={() => openEdit(e)}
              >
                <Pencil size={13} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create event dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Court Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mixed 6s Volleyball" className="mt-1 rounded-xl" required />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 mt-1 bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-1 rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Location (optional)</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Court 1" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Capacity (optional)</Label>
                <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 12" className="mt-1 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={creating} className="rounded-xl">
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit event dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label className="text-xs">Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mt-1 rounded-xl" required />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full text-sm border border-stone-200 rounded-xl px-3 py-2 mt-1 bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className="mt-1 rounded-xl" required />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input type="datetime-local" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className="mt-1 rounded-xl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Location</Label>
                <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="e.g. Court 1" className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs">Capacity</Label>
                <Input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} placeholder="No limit" className="mt-1 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event detail / RSVP management dialog */}
      <Dialog open={!!selectedDetail || loadingDetail} onOpenChange={(open) => { if (!open) { setSelectedDetail(null); setLoadingDetail(false); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          {loadingDetail && !selectedDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-stone-400" size={24} />
            </div>
          ) : selectedDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  {selectedDetail.title}
                </DialogTitle>
                <p className="text-[11px] text-stone-500 mt-1">
                  {formatToronto(new Date(selectedDetail.startTime), "EEE, MMM d · HH:mm")}–{formatToronto(new Date(selectedDetail.endTime), "HH:mm")}
                  {selectedDetail.location ? ` · ${selectedDetail.location}` : ""}
                </p>
                <div className="flex gap-4 pt-2.5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Users size={12} className="text-emerald-600" />
                    </div>
                    <span className="font-semibold tabular-nums">{selectedDetail._count.attendances}</span>
                    <span className="text-stone-400 text-xs">checked in</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Ticket size={12} className="text-purple-600" />
                    </div>
                    <span className="font-semibold tabular-nums">{selectedDetail._count.rsvps}</span>
                    <span className="text-stone-400 text-xs">RSVP'd</span>
                  </div>
                  {selectedDetail.capacity && (
                    <div className="text-xs text-stone-400 flex items-center">
                      {selectedDetail.capacity - selectedDetail._count.attendances} spots left
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* RSVPs */}
              {selectedDetail.rsvps && selectedDetail.rsvps.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Ticket size={12} />
                    RSVPs ({selectedDetail.rsvps.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selectedDetail.rsvps.map((r) => {
                      const attended = attendedUserIds.has(r.user.id);
                      return (
                        <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-100">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={r.user.image ?? undefined} />
                            <AvatarFallback className="text-[10px] bg-stone-100">{r.user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{r.user.name}</p>
                            <p className="text-[10px] text-stone-400 truncate">{r.user.email}</p>
                          </div>
                          {attended ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <CheckCircle size={10} /> Showed
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                              No-show
                            </span>
                          )}
                          <button
                            onClick={() => dropRsvp(r.user.id)}
                            disabled={droppingUser === r.user.id}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Remove RSVP"
                          >
                            {droppingUser === r.user.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <UserX size={12} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Checked-in attendees */}
              {selectedDetail.attendances && selectedDetail.attendances.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Users size={12} />
                    Checked In ({selectedDetail.attendances.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selectedDetail.attendances.map((a) => (
                      <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50/80 border border-stone-100">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={a.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px] bg-stone-100">{a.user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{a.user.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{a.user.email}</p>
                        </div>
                        <span className="text-[10px] text-stone-400 tabular-nums">
                          {formatToronto(new Date(a.scannedAt), "HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedDetail.rsvps?.length && !selectedDetail.attendances?.length && (
                <p className="text-sm text-stone-400 text-center py-8">No RSVPs or check-ins yet.</p>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
