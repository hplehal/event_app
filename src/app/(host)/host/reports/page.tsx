"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, BarChart3, Loader2, FileSpreadsheet, Users, MapPin, Calendar, TrendingUp, Trophy, ClipboardList, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { TORONTO_TZ } from "@/lib/utils";
import { toZonedTime } from "date-fns-tz";
import { format, subDays } from "date-fns";

function todayStr() {
  return format(toZonedTime(new Date(), TORONTO_TZ), "yyyy-MM-dd");
}
function thirtyDaysAgoStr() {
  return format(subDays(toZonedTime(new Date(), TORONTO_TZ), 30), "yyyy-MM-dd");
}

export default function ReportsPage() {
  const [from, setFrom] = useState(thirtyDaysAgoStr());
  const [to, setTo] = useState(todayStr());
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?from=${from}&to=${to}`);
      if (!res.ok) {
        toast.error("Failed to generate report.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `titos-courts-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully.");
    } finally {
      setLoading(false);
    }
  }

  const sheets = [
    { name: "Attendance Log", description: "Full audit trail — every check-in with timestamp, player details, event info, and minutes after session start.", icon: ClipboardList, color: "text-red-600 bg-red-50" },
    { name: "All Events", description: "Every session in the date range: title, type, day, time, duration, location, host, and check-in count.", icon: Calendar, color: "text-amber-600 bg-amber-50" },
    { name: "Player Directory", description: "All registered players with QR codes, all-time and in-period check-in counts, and join date.", icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { name: "By Event Type", description: "Breakdown by sport: total sessions, check-ins, unique players, and average attendance per session.", icon: FileSpreadsheet, color: "text-purple-600 bg-purple-50" },
    { name: "By Location", description: "Court-level metrics: sessions run, total check-ins, unique players, and average per session.", icon: MapPin, color: "text-sky-600 bg-sky-50" },
    { name: "By Day of Week", description: "Which days are busiest — sessions, check-ins, and average attendance for each day.", icon: Calendar, color: "text-orange-600 bg-orange-50" },
    { name: "By Hour of Day", description: "Peak hours analysis — sessions and check-ins for each hour (6am–10pm).", icon: TrendingUp, color: "text-teal-600 bg-teal-50" },
    { name: "Top 10 Events", description: "The 10 most attended sessions in the period, ranked by check-in count.", icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { name: "Top Players", description: "Top 20 most active players with check-in counts and sports played.", icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { name: "Daily Trend", description: "Day-by-day log: sessions run, check-ins, and unique players — great for spotting trends.", icon: TrendingUp, color: "text-rose-600 bg-rose-50" },
    { name: "Summary", description: "High-level overview: totals, averages, busiest day/location/type, and report metadata.", icon: LayoutDashboard, color: "text-stone-600 bg-stone-100" },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <BarChart3 size={22} />
          Reports
        </h1>
        <p className="text-stone-500 text-sm">Export a comprehensive attendance report as an Excel workbook</p>
      </div>

      {/* Export form */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-5">
        <h2 className="font-semibold text-stone-900">Date Range</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
          </div>
        </div>
        <Button onClick={handleExport} disabled={loading || !from || !to} className="gap-2 w-full">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {loading ? "Generating report..." : "Export Excel Report"}
        </Button>
      </div>

      {/* Sheets preview */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h2 className="font-semibold text-stone-900 mb-1">Report Contents</h2>
        <p className="text-sm text-stone-500 mb-5">
          The exported Excel file contains {sheets.length} sheets:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sheets.map((sheet, i) => {
            const Icon = sheet.icon;
            return (
              <div key={sheet.name} className="flex gap-3 p-3 rounded-xl border border-stone-100 hover:border-stone-200 transition-colors">
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${sheet.color}`}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900">{sheet.name}</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{sheet.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
