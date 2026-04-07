"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CheckSquare, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/attendance", label: "Attendance", icon: CheckSquare },
  { href: "/profile", label: "Profile", icon: User },
];

interface UserNavProps {
  userName?: string;
  userEmail?: string;
}

export function UserNav({ userName, userEmail }: UserNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — dark premium style */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-stone-950 flex-col z-40">
        {/* Logo */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TitosLogo size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{siteConfig.name}</p>
              <p className="text-stone-500 text-[10px] tracking-wide uppercase">{siteConfig.tagline}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
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

        {/* User footer */}
        {userName && (
          <div className="px-3 py-4 border-t border-white/5">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">{userName}</p>
                {userEmail && <p className="text-stone-500 text-[10px] truncate">{userEmail}</p>}
              </div>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 text-xs transition-colors">
                <LogOut size={14} />
                Sign Out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav — frosted glass */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 glass border-t border-stone-200/50 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 min-w-0 relative",
                  active
                    ? "text-amber-600"
                    : "text-stone-400 active:text-stone-600"
                )}
              >
                {active && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-amber-500" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={cn("text-[10px] font-semibold", active ? "text-amber-600" : "text-stone-400")}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
