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
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-stone-950 text-white flex-col z-40">
        <div className="px-6 py-5 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <TitosLogo size={32} />
            <div>
              <p className="font-bold text-white text-sm">{siteConfig.name}</p>
              <p className="text-amber-500/70 text-xs">{siteConfig.hostPortalName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-amber-600/20 text-amber-400" : "text-stone-400 hover:text-white hover:bg-stone-800"
              )}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-stone-800">
          <div className="mb-3">
            <p className="text-white text-sm font-medium truncate">{hostName}</p>
            <p className="text-stone-400 text-xs truncate">{hostEmail}</p>
          </div>
          <a href="/host/logout" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 text-sm transition-colors">
            <LogOut size={16} />
            Sign Out
          </a>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-stone-950 text-white flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <TitosLogo size={28} />
          <span className="font-bold text-sm">{siteConfig.shortName} Host</span>
        </div>
        <a href="/host/logout" className="text-stone-400 hover:text-white p-1">
          <LogOut size={18} />
        </a>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 z-40 flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors",
              active ? "text-amber-400" : "text-stone-400"
            )}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
