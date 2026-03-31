import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TORONTO_TZ, formatToronto } from "@/lib/utils";
import { EventBadge } from "@/components/events/EventBadge";
import { CheckCircle, Calendar, Trophy } from "lucide-react";

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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero summary banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Trophy size={28} className="text-white" />
          </div>
          <div>
            <p className="text-4xl font-extrabold leading-none">{attendances.length}</p>
            <p className="text-amber-100 text-sm mt-1">Sessions attended this week</p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-stone-900">My Attendance</h1>
        <p className="text-stone-500 text-sm">Your check-in history for this week</p>
      </div>

      {/* List */}
      {attendances.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Calendar size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm text-stone-400">No attendance recorded this week.</p>
          <p className="text-xs text-stone-300 mt-1">Check in at your next court session to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attendances.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3 hover:shadow-md hover:border-stone-300 transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <CheckCircle size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900 truncate">{a.event.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <EventBadge type={a.event.type} />
                  <span className="text-xs text-stone-400">
                    {formatToronto(a.event.startTime, "EEE, MMM d · HH:mm")}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">Scanned</p>
                <p className="text-sm font-bold text-stone-700 tabular-nums">
                  {formatToronto(a.scannedAt, "HH:mm")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
