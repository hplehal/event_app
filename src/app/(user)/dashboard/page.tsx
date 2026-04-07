import { auth } from "@/lib/auth";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/events/EventCard";
import { FeaturedEvents } from "@/components/events/FeaturedEvents";
import { CalendarCheck, TrendingUp, CalendarDays, Users, Flame } from "lucide-react";
import { RsvpButton } from "@/components/events/RsvpButton";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TORONTO_TZ } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const nowUTC = new Date();
  const nowToronto = toZonedTime(nowUTC, TORONTO_TZ);

  const todayStart = fromZonedTime(
    new Date(nowToronto.getFullYear(), nowToronto.getMonth(), nowToronto.getDate(), 0, 0, 0),
    TORONTO_TZ
  );
  const todayEnd = fromZonedTime(
    new Date(nowToronto.getFullYear(), nowToronto.getMonth(), nowToronto.getDate(), 23, 59, 59),
    TORONTO_TZ
  );

  const twoHoursLater = new Date(nowUTC.getTime() + 2 * 60 * 60 * 1000);

  const day = nowToronto.getDay();
  const monday = new Date(nowToronto);
  monday.setDate(nowToronto.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const weekStart = fromZonedTime(monday, TORONTO_TZ);
  const weekEnd = fromZonedTime(
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59),
    TORONTO_TZ
  );

  const [allToday, myTodayAttendances, myRsvps, weekAttendanceCount, totalSessions] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: todayStart, lte: todayEnd } },
      include: { _count: { select: { attendances: true, rsvps: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.attendance.findMany({
      where: { userId, scannedAt: { gte: todayStart, lte: todayEnd } },
      select: { eventId: true },
    }),
    prisma.rsvp.findMany({
      where: { userId },
      select: { eventId: true },
    }),
    prisma.attendance.count({
      where: { userId, scannedAt: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.event.count({
      where: { startTime: { gte: todayStart, lte: todayEnd } },
    }),
  ]);

  const myEventIds = myTodayAttendances.map((a) => a.eventId);
  const myRsvpIds = myRsvps.map((r) => r.eventId);
  const happeningNow = allToday.filter((e) => e.startTime <= nowUTC && e.endTime >= nowUTC);
  const startingSoon = allToday.filter((e) => e.startTime > nowUTC && e.startTime <= twoHoursLater);

  return { allToday, happeningNow, startingSoon, myEventIds, myRsvpIds, weekAttendanceCount, totalSessions };
}

async function getFeaturedEvents(userId: string) {
  const nowUTC = new Date();
  const pastAttendances = await prisma.attendance.findMany({
    where: { userId },
    include: { event: { select: { type: true, location: true, title: true } } },
    orderBy: { scannedAt: "desc" },
    take: 50,
  });

  if (pastAttendances.length === 0) return [];

  const typeCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const titleCounts: Record<string, number> = {};
  for (const a of pastAttendances) {
    typeCounts[a.event.type] = (typeCounts[a.event.type] ?? 0) + 1;
    if (a.event.location) {
      locationCounts[a.event.location] = (locationCounts[a.event.location] ?? 0) + 1;
    }
    const baseTitle = a.event.title.replace(/\s*-\s*\d{2}:\d{2}$/, "").trim();
    titleCounts[baseTitle] = (titleCounts[baseTitle] ?? 0) + 1;
  }

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const upcoming = await prisma.event.findMany({
    where: {
      startTime: { gt: nowUTC },
      type: { in: topTypes },
    },
    include: { _count: { select: { attendances: true, rsvps: true } } },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  const scored = upcoming.map((e) => {
    let score = 0;
    score += (typeCounts[e.type] ?? 0) * 2;
    if (e.location && locationCounts[e.location]) score += locationCounts[e.location];
    const baseTitle = e.title.replace(/\s*-\s*\d{2}:\d{2}$/, "").trim();
    if (titleCounts[baseTitle]) score += titleCounts[baseTitle] * 3;
    return { event: e, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((s) => s.event);
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [dashData, featured] = await Promise.all([
    getDashboardData(userId),
    getFeaturedEvents(userId),
  ]);
  const { allToday, happeningNow, startingSoon, myEventIds, myRsvpIds, weekAttendanceCount, totalSessions } = dashData;

  const name = session!.user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">{greeting}, {name}</h1>
        <p className="text-stone-500 text-sm mt-0.5">Here's what's happening on the courts today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Check-ins this week" value={weekAttendanceCount} icon={CalendarCheck} color="amber" />
        <StatCard label="Sessions today" value={totalSessions} icon={CalendarDays} color="emerald" />
        <StatCard label="Live right now" value={happeningNow.length} icon={Flame} color="orange" className="col-span-2 lg:col-span-1" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — live events + featured */}
        <div className="lg:col-span-3 space-y-5">
          {/* Happening Now */}
          {happeningNow.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Happening Now
              </h2>
              <div className="space-y-2">
                {happeningNow.map((e) => (
                  <EventCard key={e.id} event={e} isHappeningNow isRegistered={myEventIds.includes(e.id)} isRsvped={myRsvpIds.includes(e.id)} />
                ))}
              </div>
            </section>
          )}

          {/* Starting Soon */}
          {startingSoon.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <TrendingUp size={13} />
                Starting Soon
              </h2>
              <div className="space-y-2">
                {startingSoon.map((e) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <EventCard event={e} isRegistered={myEventIds.includes(e.id)} isRsvped={myRsvpIds.includes(e.id)} />
                    </div>
                    <RsvpButton eventId={e.id} initialRsvped={myRsvpIds.includes(e.id)} initialCount={e._count.rsvps} capacity={e.capacity} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {happeningNow.length === 0 && startingSoon.length === 0 && allToday.length > 0 && (
            <div className="bg-white border border-stone-200/60 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 font-medium">No sessions live right now</p>
              <p className="text-xs text-stone-400 mt-1">Check the schedule below for upcoming games.</p>
            </div>
          )}

          {/* Featured For You */}
          <FeaturedEvents events={featured} rsvpIds={myRsvpIds} />
        </div>

        {/* Right — today's schedule */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today's Schedule</h2>
            <span className="text-[11px] text-stone-400 font-medium bg-stone-100 px-2 py-0.5 rounded-full tabular-nums">{allToday.length}</span>
          </div>
          {allToday.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-sm bg-white rounded-2xl border border-stone-200/60">
              <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
              No sessions today.
            </div>
          ) : (
            <div className="space-y-2 lg:max-h-[calc(100vh-260px)] lg:overflow-y-auto scrollbar-thin lg:pr-1">
              {allToday.map((e) => {
                const isPast = new Date(e.endTime) < new Date();
                return (
                  <div key={e.id} className={isPast ? "opacity-35 hover:opacity-60 transition-opacity" : ""}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <EventCard event={e} isRegistered={myEventIds.includes(e.id)} isRsvped={myRsvpIds.includes(e.id)} />
                      </div>
                      {!isPast && (
                        <RsvpButton eventId={e.id} initialRsvped={myRsvpIds.includes(e.id)} initialCount={e._count.rsvps} capacity={e.capacity} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
