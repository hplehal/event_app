import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "amber" | "emerald" | "purple" | "orange";
  className?: string;
}

const colorMap = {
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
};

const iconColorMap = {
  amber: "text-amber-500",
  emerald: "text-emerald-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
};

export function StatCard({ label, value, icon: Icon, color = "amber", className }: StatCardProps) {
  return (
    <div className={cn("bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4", className)}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border", colorMap[color])}>
        <Icon size={20} className={iconColorMap[color]} />
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        <p className="text-sm text-stone-500">{label}</p>
      </div>
    </div>
  );
}
