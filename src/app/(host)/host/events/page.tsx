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

  // Edit state
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "", title: "", type: "VOLLEYBALL", startTime: "", endTime: "", location: "", capacity: "",
  });
  const [saving, setSaving] = useState(false);

  // Event detail / RSVP management
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
      // Refresh detail
      const refreshed = await fetch(`/api/events/${selectedDetail.id}`).then((r) => r.json());
      setSelectedDetail(refreshed);
      refreshEvents();
    } finally {
      setDroppingUser(null);
    }
  }

  if (!dateStr) return null;

  const displayDate = new Date(dateStr + "T12:00:00");

  // Build a set of attended user IDs for the selected event
  const attendedUserIds = new Set(selectedDetail?.attendances?.map((a) => a.user.id) ?? []);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Events</h1>
          <p className="text-stone-500 text-sm">Manage and view court sessions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled className="gap-2 opacity-60 hidden sm:flex">
            <Upload size={15} />
            Import XLSX
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={15} />
            New Event
          </Button>
        </div>
      </div>

      {/* Date navigator + type filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-2 py-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevDay}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium px-2 min-w-[120px] text-center">
            {format(displayDate, "EEE, MMM d yyyy")}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextDay}>
            <ChevronRight size={14} />
          </Button>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-white text-stone-700"
        >
          <option value="ALL">All Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-sm">
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
                className="h-8 w-8 text-stone-400 hover:text-amber-600 shrink-0"
                onClick={() => openEdit(e)}
              >
                <Pencil size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create event dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Court Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mixed 6s Volleyball" className="mt-1" required />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 mt-1 bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="mt-1" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Location (optional)</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Court 1" className="mt-1" />
              </div>
              <div>
                <Label>Capacity (optional)</Label>
                <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 12" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit event dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mt-1" required />
            </div>
            <div>
              <Label>Type</Label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full text-sm border border-stone-200 rounded-lg px-3 py-2 mt-1 bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="datetime-local" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} className="mt-1" required />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} className="mt-1" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Location</Label>
                <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="e.g. Court 1" className="mt-1" />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" min="1" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} placeholder="No limit" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event detail / RSVP management dialog */}
      <Dialog open={!!selectedDetail || loadingDetail} onOpenChange={(open) => { if (!open) { setSelectedDetail(null); setLoadingDetail(false); } }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {loadingDetail && !selectedDetail ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-stone-400" size={24} />
            </div>
          ) : selectedDetail ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedDetail.title}
                </DialogTitle>
                <p className="text-sm text-stone-500">
                  {formatToronto(new Date(selectedDetail.startTime), "EEE, MMM d · HH:mm")}–{formatToronto(new Date(selectedDetail.endTime), "HH:mm")}
                  {selectedDetail.location ? ` · ${selectedDetail.location}` : ""}
                </p>
                <div className="flex gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users size={14} className="text-emerald-500" />
                    <span className="font-semibold">{selectedDetail._count.attendances}</span>
                    <span className="text-stone-400">checked in</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Ticket size={14} className="text-purple-500" />
                    <span className="font-semibold">{selectedDetail._count.rsvps}</span>
                    <span className="text-stone-400">RSVP'd</span>
                  </div>
                  {selectedDetail.capacity && (
                    <div className="text-sm text-stone-400">
                      {selectedDetail.capacity - selectedDetail._count.attendances} spots left
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* RSVPs with show/no-show status */}
              {selectedDetail.rsvps && selectedDetail.rsvps.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
                    <Ticket size={14} />
                    RSVPs ({selectedDetail.rsvps.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selectedDetail.rsvps.map((r) => {
                      const attended = attendedUserIds.has(r.user.id);
                      return (
                        <div key={r.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-stone-50 border border-stone-100">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={r.user.image ?? undefined} />
                            <AvatarFallback className="text-[10px]">{r.user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 truncate">{r.user.name}</p>
                            <p className="text-[10px] text-stone-400 truncate">{r.user.email}</p>
                          </div>
                          {attended ? (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle size={10} /> Showed
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              No-show
                            </span>
                          )}
                          <button
                            onClick={() => dropRsvp(r.user.id)}
                            disabled={droppingUser === r.user.id}
                            className="p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Remove RSVP"
                          >
                            {droppingUser === r.user.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <UserX size={13} />
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
                  <h3 className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
                    <Users size={14} />
                    Checked In ({selectedDetail.attendances.length})
                  </h3>
                  <div className="space-y-1.5">
                    {selectedDetail.attendances.map((a) => (
                      <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-stone-50 border border-stone-100">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={a.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">{a.user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">{a.user.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{a.user.email}</p>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {formatToronto(new Date(a.scannedAt), "HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedDetail.rsvps?.length && !selectedDetail.attendances?.length && (
                <p className="text-sm text-stone-400 text-center py-6">No RSVPs or check-ins yet.</p>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
