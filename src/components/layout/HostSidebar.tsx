"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ScanLine, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";

const NAV_ITEMS = [
  { href: "/host/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/host/events", label: "Events", icon: CalendarDays },
  { href: "/host/scan", label: "Scan", icon: ScanLine },
  { href: "/host/reports", label: "Reports", icon: BarChart3 },
];

interface HostSidebarProps {
  hostName: string;
  hostEmail: string;
}

export function HostSidebar({ hostName, hostEmail }: HostSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-stone-950 flex-col z-40">
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TitosLogo size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{siteConfig.name}</p>
              <p className="text-amber-500/60 text-[10px] tracking-wide uppercase font-medium">Host Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                active
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              )}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {label}
                {active && <span className="ml-auto w-1 h-4 rounded-full bg-amber-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 text-xs font-bold">
              {hostName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{hostName}</p>
              <p className="text-stone-500 text-[10px] truncate">{hostEmail}</p>
            </div>
          </div>
          <a href="/host/logout" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors">
            <LogOut size={14} />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-stone-950/95 glass text-white flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <TitosLogo size={16} />
          </div>
          <span className="font-bold text-sm">{siteConfig.shortName} Host</span>
        </div>
        <a href="/host/logout" className="text-stone-400 hover:text-white p-1">
          <LogOut size={18} />
        </a>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-950/95 glass border-t border-white/5 z-40 safe-bottom">
        <div className="flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-semibold transition-colors relative",
                active ? "text-amber-400" : "text-stone-500"
              )}>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-amber-500" />}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
