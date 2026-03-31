import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";
import { MapPin, Trophy, Users } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-950 flex items-center justify-center p-4">
      {/* Mobile: single card / Desktop: two-panel */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 md:bg-white md:rounded-3xl md:overflow-hidden md:shadow-2xl md:shadow-amber-900/20">

        {/* Left panel — branding (desktop only, dark bg) */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/60 p-10 text-white">
          <div>
            <TitosLogo size={56} />
            <h1 className="text-3xl font-bold mt-6">{siteConfig.name}</h1>
            <p className="text-amber-400/80 text-sm mt-2">{siteConfig.tagline}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-stone-300">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Trophy size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Book Court Sessions</p>
                <p className="text-xs text-stone-400">Volleyball, basketball, tennis & more</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-stone-300">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <Users size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">QR Check-in</p>
                <p className="text-xs text-stone-400">Scan in and track your attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-stone-300">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPin size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Find Open Courts</p>
                <p className="text-xs text-stone-400">See what's happening in real-time</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-6">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>

        {/* Right panel — login form */}
        <div className="flex flex-col justify-center">
          {/* Mobile-only logo header */}
          <div className="md:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <TitosLogo size={64} />
            </div>
            <h1 className="text-2xl font-bold text-white">{siteConfig.name}</h1>
            <p className="text-amber-400/70 text-sm mt-1">{siteConfig.tagline}</p>
          </div>

          <div className="bg-white rounded-2xl md:rounded-none p-8 md:p-10 shadow-2xl md:shadow-none">
            <h2 className="text-xl font-bold text-stone-900 mb-1">Welcome back</h2>
            <p className="text-stone-500 text-sm mb-8">
              Sign in to view courts, events, and check-ins.
            </p>
            <UserLoginForm />

            <div className="mt-8 pt-6 border-t border-stone-100">
              <p className="text-center text-stone-400 text-sm">
                Are you a host?{" "}
                <a href="/host/login" className="text-amber-600 hover:text-amber-500 font-medium">
                  Host sign in →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
