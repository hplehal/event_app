import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "amber" | "emerald" | "purple" | "orange" | "sky";
  className?: string;
}

const colorMap = {
  amber: {
    iconBg: "bg-amber-500/10",
    icon: "text-amber-500",
    ring: "ring-amber-500/5",
  },
  emerald: {
    iconBg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    ring: "ring-emerald-500/5",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    icon: "text-purple-500",
    ring: "ring-purple-500/5",
  },
  orange: {
    iconBg: "bg-orange-500/10",
    icon: "text-orange-500",
    ring: "ring-orange-500/5",
  },
  sky: {
    iconBg: "bg-sky-500/10",
    icon: "text-sky-500",
    ring: "ring-sky-500/5",
  },
};

export function StatCard({ label, value, icon: Icon, color = "amber", className }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn(
      "bg-white border border-stone-200/60 rounded-2xl p-5 flex items-center gap-4 ring-1 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300",
      c.ring,
      className
    )}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.iconBg)}>
        <Icon size={20} className={c.icon} strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-900 leading-none tracking-tight">{value}</p>
        <p className="text-xs text-stone-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}
