import { auth } from "@/lib/auth";
import { TorontoClock } from "@/components/dashboard/TorontoClock";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventCard } from "@/components/events/EventCard";
import { CalendarCheck, TrendingUp, CalendarDays, Users, Flame } from "lucide-react";

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

  const [allToday, myTodayAttendances, weekAttendanceCount, totalSessions] = await Promise.all([
    prisma.event.findMany({
      where: { startTime: { gte: todayStart, lte: todayEnd } },
      include: { _count: { select: { attendances: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.attendance.findMany({
      where: { userId, scannedAt: { gte: todayStart, lte: todayEnd } },
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
  const happeningNow = allToday.filter((e) => e.startTime <= nowUTC && e.endTime >= nowUTC);
  const startingSoon = allToday.filter((e) => e.startTime > nowUTC && e.startTime <= twoHoursLater);

  return { allToday, happeningNow, startingSoon, myEventIds, weekAttendanceCount, totalSessions };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const { allToday, happeningNow, startingSoon, myEventIds, weekAttendanceCount, totalSessions } =
    await getDashboardData(userId);

  const name = session!.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Hero welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900/40 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,166,35,0.15)_0%,_transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Hi, {name}</h1>
            <p className="text-stone-300 text-sm mt-1">Here's what's on the courts today</p>
          </div>
          <TorontoClock />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Check-ins this week"
          value={weekAttendanceCount}
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          label="Sessions today"
          value={totalSessions}
          icon={CalendarDays}
          color="emerald"
        />
        <StatCard
          label="Live right now"
          value={happeningNow.length}
          icon={Flame}
          color="orange"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Desktop: two-column layout / Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — main events feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Happening Now */}
          {happeningNow.length > 0 && (
            <section className="bg-green-50/50 border border-green-200 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Happening Now ({happeningNow.length})
              </h2>
              <div className="space-y-2">
                {happeningNow.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    isHappeningNow
                    isRegistered={myEventIds.includes(e.id)}
                    showAttendanceCount={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Starting Soon */}
          {startingSoon.length > 0 && (
            <section className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                <TrendingUp size={14} />
                Starting Soon ({startingSoon.length})
              </h2>
              <div className="space-y-2">
                {startingSoon.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    isRegistered={myEventIds.includes(e.id)}
                    showAttendanceCount={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* If nothing is live or starting, show a message */}
          {happeningNow.length === 0 && startingSoon.length === 0 && allToday.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center">
              <Users size={28} className="mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No sessions live right now. Check the schedule for upcoming games.</p>
            </div>
          )}
        </div>

        {/* Right column — today's schedule */}
        <div className="lg:col-span-2">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wide">
                Today's Schedule
              </h2>
              <span className="text-xs text-stone-400 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                {allToday.length} sessions
              </span>
            </div>
            {allToday.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm bg-white rounded-2xl border border-stone-200">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                No games or sessions scheduled today.
              </div>
            ) : (
              <div className="space-y-2 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto lg:pr-1">
                {allToday.map((e) => {
                  const isPast = new Date(e.endTime) < new Date();
                  return (
                    <div key={e.id} className={isPast ? "opacity-40" : ""}>
                      <EventCard
                        event={e}
                        isRegistered={myEventIds.includes(e.id)}
                        showAttendanceCount={false}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
