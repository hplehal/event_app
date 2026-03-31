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
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200 flex-col z-40">
        <div className="px-6 py-5 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <TitosLogo size={32} />
            <div>
              <p className="font-bold text-stone-900 text-sm">{siteConfig.name}</p>
              <p className="text-stone-400 text-xs">{siteConfig.tagline}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              )}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {userName && (
          <div className="px-4 py-4 border-t border-stone-200">
            <div className="mb-3">
              <p className="text-stone-900 text-sm font-medium truncate">{userName}</p>
              {userEmail && <p className="text-stone-400 text-xs truncate">{userEmail}</p>}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 text-sm transition-colors">
                <LogOut size={16} />
                Sign Out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0",
                  active
                    ? "text-amber-600"
                    : "text-stone-400 hover:text-stone-600"
                )}
              >
                <Icon
                  size={22}
                  className={active ? "text-amber-600" : "text-stone-400"}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <span className={cn("text-xs font-medium", active ? "text-amber-600" : "text-stone-400")}>
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
