import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { TORONTO_TZ, formatToronto } from "@/lib/utils";
import { EventBadge } from "@/components/events/EventBadge";
import { CheckCircle, Calendar } from "lucide-react";

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
    orderBy: { scannedAt: "asc" },
  });
}

export default async function AttendancePage() {
  const session = await auth();
  const attendances = await getWeeklyAttendance(session!.user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Attendance</h1>
        <p className="text-stone-500 text-sm">Sessions you attended this week</p>
      </div>

      {/* Summary */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <CheckCircle size={20} className="text-amber-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-900">{attendances.length}</p>
          <p className="text-sm text-amber-700">Sessions attended this week</p>
        </div>
      </div>

      {/* List — grid on desktop */}
      {attendances.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No attendance recorded this week.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {attendances.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-stone-200 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 truncate">{a.event.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <EventBadge type={a.event.type} />
                  <span className="text-xs text-stone-400">
                    {formatToronto(a.event.startTime, "EEE, MMM d · HH:mm")}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-stone-400">Scanned</p>
                <p className="text-xs font-medium text-stone-600">
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
