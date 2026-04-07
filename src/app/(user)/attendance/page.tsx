import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TORONTO_TZ, formatToronto } from "@/lib/utils";
import { EventBadge } from "@/components/events/EventBadge";
import { CheckCircle, Calendar, Trophy, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

async function getWeeklyAttendance(userId: string) {
  const nowToronto = toZonedTime(new Date(), TORONTO_TZ);
  const day = nowToronto.getDay();
  const monday = new Date(nowToronto);
  monday.setDate(nowToronto.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const weekStart = fromZonedTime(monday, TORONTO_TZ);
  const weekEnd = fromZonedTime(
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59),
    TORONTO_TZ
  );

  return prisma.attendance.findMany({
    where: { userId, scannedAt: { gte: weekStart, lte: weekEnd } },
    include: { event: true },
    orderBy: { scannedAt: "desc" },
  });
}

export default async function AttendancePage() {
  const session = await auth();
  const attendances = await getWeeklyAttendance(session!.user.id);

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Attendance</h1>
          <p className="text-stone-500 text-sm mt-0.5">Your check-in history this week</p>
        </div>
        <div className="flex items-center gap-2.5 bg-white border border-stone-200/60 rounded-2xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Trophy size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-stone-900 leading-none tabular-nums">{attendances.length}</p>
            <p className="text-[10px] text-stone-400 font-medium">THIS WEEK</p>
          </div>
        </div>
      </div>

      {/* List */}
      {attendances.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/60">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3">
            <Calendar size={24} className="text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-500">No check-ins this week</p>
          <p className="text-xs text-stone-400 mt-1">Attend a session and check in to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attendances.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-stone-200/60 rounded-2xl p-4 flex items-start gap-3.5 hover:shadow-md hover:shadow-stone-100 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 text-sm truncate">{a.event.title}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <EventBadge type={a.event.type} />
                  <span className="text-[11px] text-stone-400">
                    {formatToronto(a.event.startTime, "EEE, MMM d")}
                  </span>
                  {a.event.location && (
                    <span className="flex items-center gap-0.5 text-[11px] text-stone-400">
                      <MapPin size={9} />
                      {a.event.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-stone-700 tabular-nums">
                  {formatToronto(a.scannedAt, "HH:mm")}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">checked in</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
