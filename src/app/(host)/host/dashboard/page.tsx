import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventBadge } from "@/components/events/EventBadge";
import { formatToronto, TORONTO_TZ } from "@/lib/utils";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { CalendarDays, Users, CheckSquare, TrendingUp, Ticket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getStats() {
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

  const [totalEvents, totalAttendances, totalRsvps, todayEvents, todayAttendances, topEvents, recentAttendances, upcomingWithRsvps] =
    await Promise.all([
      prisma.event.count(),
      prisma.attendance.count(),
      prisma.rsvp.count(),
      prisma.event.count({ where: { startTime: { gte: todayStart, lte: todayEnd } } }),
      prisma.attendance.count({ where: { scannedAt: { gte: todayStart, lte: todayEnd } } }),
      prisma.event.findMany({
        include: { _count: { select: { attendances: true, rsvps: true } } },
        orderBy: { attendances: { _count: "desc" } },
        take: 5,
      }),
      prisma.attendance.findMany({
        include: {
          event: true,
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { scannedAt: "desc" },
        take: 10,
      }),
      // Upcoming events with RSVP counts for the RSVP vs Attendance section
      prisma.event.findMany({
        where: { startTime: { gte: todayStart } },
        include: { _count: { select: { attendances: true, rsvps: true } } },
        orderBy: { startTime: "asc" },
        take: 10,
      }),
    ]);

  return { totalEvents, totalAttendances, totalRsvps, todayEvents, todayAttendances, topEvents, recentAttendances, upcomingWithRsvps };
}

export default async function HostDashboardPage() {
  const { totalEvents, totalAttendances, totalRsvps, todayEvents, todayAttendances, topEvents, recentAttendances, upcomingWithRsvps } =
    await getStats();

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm">Overview of all court events and player check-ins</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Sessions" value={totalEvents} icon={CalendarDays} color="amber" />
        <StatCard label="Total Check-ins" value={totalAttendances} icon={CheckSquare} color="emerald" />
        <StatCard label="Total RSVPs" value={totalRsvps} icon={Ticket} color="purple" />
        <StatCard label="Sessions Today" value={todayEvents} icon={TrendingUp} color="sky" />
        <StatCard label="Check-ins Today" value={todayAttendances} icon={Users} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 mb-4">Most Popular Sessions</h2>
          <div className="space-y-3">
            {topEvents.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{e.title.split(" - ")[0]}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <EventBadge type={e.type} />
                    <span className="text-[10px] text-stone-400">{e._count.rsvps} RSVPs</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-700">{e._count.attendances}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendances */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold text-stone-900 mb-4">Recent Check-ins</h2>
          <div className="space-y-3">
            {recentAttendances.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={a.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">{a.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{a.user.name}</p>
                  <p className="text-xs text-stone-400 truncate">{a.event.title.split(" - ")[0]}</p>
                </div>
                <span className="text-xs text-stone-400 flex-shrink-0">
                  {formatToronto(a.scannedAt, "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RSVP vs Attendance */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h2 className="font-semibold text-stone-900 mb-1">RSVP vs Attendance</h2>
        <p className="text-xs text-stone-400 mb-4">Upcoming & today's sessions — how many who RSVP'd actually showed up</p>
        {upcomingWithRsvps.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-4">No upcoming sessions.</p>
        ) : (
          <div className="space-y-3">
            {upcomingWithRsvps.map((e) => {
              const rsvps = e._count.rsvps;
              const attended = e._count.attendances;
              const showRate = rsvps > 0 && attended > 0;
              const rate = rsvps > 0 ? Math.round((attended / rsvps) * 100) : 0;
              const isPast = new Date(e.endTime) < new Date();
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{e.title.split(" - ")[0]}</p>
                    <p className="text-xs text-stone-400">
                      {formatToronto(e.startTime, "EEE, MMM d · HH:mm")}
                      {e.capacity ? ` · ${e.capacity} spots` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-bold text-purple-600">{rsvps}</p>
                      <p className="text-[10px] text-stone-400">RSVPs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-600">{attended}</p>
                      <p className="text-[10px] text-stone-400">Showed</p>
                    </div>
                    {isPast && showRate && (
                      <div className="text-center">
                        <p className={`text-sm font-bold ${rate >= 70 ? "text-green-600" : rate >= 40 ? "text-amber-600" : "text-red-500"}`}>
                          {rate}%
                        </p>
                        <p className="text-[10px] text-stone-400">Rate</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
