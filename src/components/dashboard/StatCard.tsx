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
  amber: {
    card: "border-amber-100",
    iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
    text: "text-amber-600",
  },
  emerald: {
    card: "border-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    text: "text-emerald-600",
  },
  purple: {
    card: "border-purple-100",
    iconBg: "bg-gradient-to-br from-purple-400 to-purple-600",
    text: "text-purple-600",
  },
  orange: {
    card: "border-orange-100",
    iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
    text: "text-orange-600",
  },
};

export function StatCard({ label, value, icon: Icon, color = "amber", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("bg-white border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow", c.card, className)}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", c.iconBg)}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-stone-900 leading-none">{value}</p>
        <p className="text-sm text-stone-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
