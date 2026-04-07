import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";
import { Zap, QrCode, CalendarCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand showcase (desktop only) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-stone-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgba(217,119,6,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,_rgba(245,158,11,0.08)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <TitosLogo size={44} />
              <span className="text-white/90 font-semibold text-lg tracking-tight">{siteConfig.name}</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] max-w-md">
              Your court,<br />
              <span className="text-amber-400">your schedule.</span>
            </h1>
            <p className="text-stone-400 text-base mt-4 max-w-sm leading-relaxed">
              RSVP to sessions, check in with QR, and never miss a game.
            </p>
          </div>

          <div className="space-y-5 max-w-sm">
            {[
              { icon: CalendarCheck, title: "RSVP & Reserve", desc: "Secure your spot before it fills up" },
              { icon: QrCode, title: "Instant Check-in", desc: "Scan your QR code at the door" },
              { icon: Zap, title: "Live Updates", desc: "See what's happening right now" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-stone-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-stone-600 text-xs">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 lg:from-stone-50 lg:via-white lg:to-stone-50 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 mb-5">
              <TitosLogo size={36} />
            </div>
            <h1 className="text-2xl font-bold text-white">{siteConfig.name}</h1>
            <p className="text-stone-400 text-sm mt-1">{siteConfig.tagline}</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 lg:shadow-lg border border-stone-200/60">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-stone-900">Welcome back</h2>
              <p className="text-stone-500 text-sm mt-1">Sign in to access your courts and events.</p>
            </div>

            <UserLoginForm />

            <div className="mt-8 pt-5 border-t border-stone-100 text-center">
              <p className="text-stone-400 text-sm">
                Court manager?{" "}
                <a href="/host/login" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                  Host login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
