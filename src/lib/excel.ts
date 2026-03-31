import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { TORONTO_TZ, EVENT_TYPE_LABELS, EventType } from "@/lib/utils";
import { toZonedTime, format } from "date-fns-tz";

function torontoHour(date: Date): number {
  return toZonedTime(date, TORONTO_TZ).getHours();
}

function torontoDayName(date: Date): string {
  return format(date, "EEEE", { timeZone: TORONTO_TZ });
}

function torontoDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd", { timeZone: TORONTO_TZ });
}

function torontoTimeStr(date: Date): string {
  return format(date, "HH:mm", { timeZone: TORONTO_TZ });
}

function torontoDateTimeStr(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm:ss", { timeZone: TORONTO_TZ });
}

function typeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type as EventType] ?? type;
}

export async function generateReport(from: Date, to: Date): Promise<Buffer> {
  const wb = XLSX.utils.book_new();

  // Fetch all data needed
  const [events, attendances, allUsers] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: from, lte: to } },
      include: {
        _count: { select: { attendances: true } },
        host: { select: { name: true, email: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.attendance.findMany({
      where: { scannedAt: { gte: from, lte: to } },
      include: {
        event: { select: { title: true, type: true, startTime: true, endTime: true, location: true } },
        user: { select: { name: true, email: true, qrCode: true } },
      },
      orderBy: { scannedAt: "asc" },
    }),
    prisma.user.findMany({
      include: {
        _count: { select: { attendances: true } },
        attendances: {
          where: { scannedAt: { gte: from, lte: to } },
          select: { id: true },
        },
      },
    }),
  ]);

  // ── Sheet 1: Attendance Log (full audit trail) ────────────────────────────
  const logSheet = attendances.map((a) => ({
    "Date": torontoDateStr(a.scannedAt),
    "Scanned At": torontoDateTimeStr(a.scannedAt),
    "Player Name": a.user.name,
    "Player Email": a.user.email,
    "Player Code": a.user.qrCode,
    "Event": a.event.title,
    "Event Type": typeLabel(a.event.type),
    "Event Start": torontoTimeStr(a.event.startTime),
    "Event End": torontoTimeStr(a.event.endTime),
    "Location": a.event.location ?? "",
    "Minutes After Start": Math.round(
      (a.scannedAt.getTime() - a.event.startTime.getTime()) / 60000
    ),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logSheet), "Attendance Log");

  // ── Sheet 2: All Events ───────────────────────────────────────────────────
  const eventsSheet = events.map((e) => ({
    "Title": e.title,
    "Type": typeLabel(e.type),
    "Date": torontoDateStr(e.startTime),
    "Day": torontoDayName(e.startTime),
    "Start": torontoTimeStr(e.startTime),
    "End": torontoTimeStr(e.endTime),
    "Duration (min)": Math.round(
      (e.endTime.getTime() - e.startTime.getTime()) / 60000
    ),
    "Location": e.location ?? "",
    "Host": e.host.name,
    "Check-ins": e._count.attendances,
    "Created": torontoDateTimeStr(e.createdAt),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eventsSheet), "All Events");

  // ── Sheet 3: Player Directory ─────────────────────────────────────────────
  const playerSheet = allUsers
    .map((u) => ({
      "Name": u.name,
      "Email": u.email,
      "Player Code": u.qrCode,
      "Total All-Time Check-ins": u._count.attendances,
      "Check-ins This Period": u.attendances.length,
      "Joined": torontoDateStr(u.createdAt),
    }))
    .sort((a, b) => b["Check-ins This Period"] - a["Check-ins This Period"]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(playerSheet), "Player Directory");

  // ── Sheet 4: By Event Type ────────────────────────────────────────────────
  const byType: Record<string, { total: number; users: Set<string>; events: number }> = {};
  for (const e of events) {
    if (!byType[e.type]) byType[e.type] = { total: 0, users: new Set(), events: 0 };
    byType[e.type].events++;
  }
  for (const a of attendances) {
    const type = a.event.type;
    if (!byType[type]) byType[type] = { total: 0, users: new Set(), events: 0 };
    byType[type].total++;
    byType[type].users.add(a.user.email);
  }
  const typeSheet = Object.entries(byType)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([type, d]) => ({
      "Event Type": typeLabel(type),
      "Total Sessions": d.events,
      "Total Check-ins": d.total,
      "Unique Players": d.users.size,
      "Avg Check-ins / Session": d.events > 0 ? Math.round((d.total / d.events) * 10) / 10 : 0,
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(typeSheet), "By Event Type");

  // ── Sheet 5: By Location ──────────────────────────────────────────────────
  const byLocation: Record<string, { total: number; users: Set<string>; events: number }> = {};
  for (const e of events) {
    const loc = e.location ?? "Unknown";
    if (!byLocation[loc]) byLocation[loc] = { total: 0, users: new Set(), events: 0 };
    byLocation[loc].events++;
  }
  for (const a of attendances) {
    const loc = a.event.location ?? "Unknown";
    if (!byLocation[loc]) byLocation[loc] = { total: 0, users: new Set(), events: 0 };
    byLocation[loc].total++;
    byLocation[loc].users.add(a.user.email);
  }
  const locationSheet = Object.entries(byLocation)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([loc, d]) => ({
      "Location": loc,
      "Total Sessions": d.events,
      "Total Check-ins": d.total,
      "Unique Players": d.users.size,
      "Avg Check-ins / Session": d.events > 0 ? Math.round((d.total / d.events) * 10) / 10 : 0,
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(locationSheet), "By Location");

  // ── Sheet 6: By Day of Week ───────────────────────────────────────────────
  const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const byDay: Record<string, { checkins: number; sessions: number }> = {};
  for (const d of DAY_ORDER) byDay[d] = { checkins: 0, sessions: 0 };
  for (const e of events) {
    const day = torontoDayName(e.startTime);
    if (byDay[day]) byDay[day].sessions++;
  }
  for (const a of attendances) {
    const day = torontoDayName(a.scannedAt);
    if (byDay[day]) byDay[day].checkins++;
  }
  const daySheet = DAY_ORDER.map((day) => ({
    "Day of Week": day,
    "Total Sessions": byDay[day].sessions,
    "Total Check-ins": byDay[day].checkins,
    "Avg Check-ins / Session": byDay[day].sessions > 0
      ? Math.round((byDay[day].checkins / byDay[day].sessions) * 10) / 10 : 0,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(daySheet), "By Day of Week");

  // ── Sheet 7: By Hour of Day ───────────────────────────────────────────────
  const byHour: Record<number, { checkins: number; sessions: number }> = {};
  for (let h = 6; h <= 22; h++) byHour[h] = { checkins: 0, sessions: 0 };
  for (const e of events) {
    const h = torontoHour(e.startTime);
    if (byHour[h]) byHour[h].sessions++;
  }
  for (const a of attendances) {
    const h = torontoHour(a.scannedAt);
    if (byHour[h]) byHour[h].checkins++;
  }
  const hourSheet = Object.entries(byHour).map(([h, d]) => ({
    "Hour": `${h.toString().padStart(2, "0")}:00`,
    "Sessions": d.sessions,
    "Check-ins": d.checkins,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(hourSheet), "By Hour of Day");

  // ── Sheet 8: Top 10 Events ────────────────────────────────────────────────
  const top10 = [...events]
    .sort((a, b) => b._count.attendances - a._count.attendances)
    .slice(0, 10)
    .map((e, i) => ({
      "Rank": i + 1,
      "Title": e.title,
      "Type": typeLabel(e.type),
      "Date": torontoDateStr(e.startTime),
      "Time": `${torontoTimeStr(e.startTime)} – ${torontoTimeStr(e.endTime)}`,
      "Location": e.location ?? "",
      "Check-ins": e._count.attendances,
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(top10), "Top 10 Events");

  // ── Sheet 9: Top Players ──────────────────────────────────────────────────
  const playerCheckins: Record<string, { name: string; email: string; count: number; types: Set<string> }> = {};
  for (const a of attendances) {
    if (!playerCheckins[a.user.email]) {
      playerCheckins[a.user.email] = { name: a.user.name, email: a.user.email, count: 0, types: new Set() };
    }
    playerCheckins[a.user.email].count++;
    playerCheckins[a.user.email].types.add(a.event.type);
  }
  const topPlayers = Object.values(playerCheckins)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map((p, i) => ({
      "Rank": i + 1,
      "Name": p.name,
      "Email": p.email,
      "Check-ins": p.count,
      "Sports Played": Array.from(p.types).map(typeLabel).join(", "),
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topPlayers), "Top Players");

  // ── Sheet 10: Daily Trend ─────────────────────────────────────────────────
  const dailyData: Record<string, { checkins: number; sessions: number; uniquePlayers: Set<string> }> = {};
  for (const e of events) {
    const d = torontoDateStr(e.startTime);
    if (!dailyData[d]) dailyData[d] = { checkins: 0, sessions: 0, uniquePlayers: new Set() };
    dailyData[d].sessions++;
  }
  for (const a of attendances) {
    const d = torontoDateStr(a.scannedAt);
    if (!dailyData[d]) dailyData[d] = { checkins: 0, sessions: 0, uniquePlayers: new Set() };
    dailyData[d].checkins++;
    dailyData[d].uniquePlayers.add(a.user.email);
  }
  const trendSheet = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      "Date": date,
      "Day": torontoDayName(new Date(date + "T12:00:00")),
      "Sessions": d.sessions,
      "Check-ins": d.checkins,
      "Unique Players": d.uniquePlayers.size,
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trendSheet), "Daily Trend");

  // ── Sheet 11: Summary ─────────────────────────────────────────────────────
  const uniquePlayersTotal = new Set(attendances.map((a) => a.user.email));
  const summarySheet = [
    { "Metric": "Report Period", "Value": `${torontoDateStr(from)} to ${torontoDateStr(to)}` },
    { "Metric": "Total Sessions", "Value": events.length.toString() },
    { "Metric": "Total Check-ins", "Value": attendances.length.toString() },
    { "Metric": "Unique Players", "Value": uniquePlayersTotal.size.toString() },
    { "Metric": "Avg Check-ins / Session", "Value": events.length > 0 ? (Math.round((attendances.length / events.length) * 10) / 10).toString() : "0" },
    { "Metric": "Avg Sessions / Day", "Value": (() => {
      const days = new Set(events.map((e) => torontoDateStr(e.startTime)));
      return days.size > 0 ? (Math.round((events.length / days.size) * 10) / 10).toString() : "0";
    })() },
    { "Metric": "Most Popular Type", "Value": (() => {
      const sorted = Object.entries(byType).sort((a, b) => b[1].total - a[1].total);
      return sorted.length > 0 ? typeLabel(sorted[0][0]) : "N/A";
    })() },
    { "Metric": "Busiest Location", "Value": (() => {
      const sorted = Object.entries(byLocation).sort((a, b) => b[1].total - a[1].total);
      return sorted.length > 0 ? sorted[0][0] : "N/A";
    })() },
    { "Metric": "Busiest Day", "Value": (() => {
      const sorted = DAY_ORDER.slice().sort((a, b) => byDay[b].checkins - byDay[a].checkins);
      return sorted[0];
    })() },
    { "Metric": "Generated", "Value": torontoDateTimeStr(new Date()) },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), "Summary");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
