import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signHostToken } from "@/lib/host-auth";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";
import { ScanLine, BarChart3, CalendarDays } from "lucide-react";

async function loginAction(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    redirect("/host/login?error=missing");
  }

  const host = await prisma.host.findUnique({ where: { email } });
  if (!host) {
    redirect("/host/login?error=invalid");
  }

  const valid = await bcrypt.compare(password, host.passwordHash);
  if (!valid) {
    redirect("/host/login?error=invalid");
  }

  const token = await signHostToken({ hostId: host.id, email: host.email, name: host.name });
  const cookieStore = await cookies();
  cookieStore.set("host-token", token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  redirect("/host/scan");
}

export default function HostLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const errorMessages: Record<string, string> = {
    missing: "Please enter your email and password.",
    invalid: "Invalid email or password.",
  };

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(245,158,11,0.08),transparent_60%)]" />
        <div className="relative z-10 max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <TitosLogo size={28} />
            </div>
            <div>
              <p className="font-bold text-white text-lg">{siteConfig.name}</p>
              <p className="text-amber-500/60 text-xs tracking-wide uppercase font-medium">Host Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Manage your courts,<br />track your players.
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Scan check-ins, manage events, view attendance reports, and keep your courts running smoothly.
          </p>
          <div className="space-y-3 text-sm text-stone-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <ScanLine size={15} className="text-amber-500" />
              </div>
              <span>Quick QR code scanning for check-ins</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 size={15} className="text-amber-500" />
              </div>
              <span>Detailed attendance & RSVP reports</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <CalendarDays size={15} className="text-amber-500" />
              </div>
              <span>Create and manage court sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <TitosLogo size={28} />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">{siteConfig.name}</h1>
            <p className="text-amber-500/60 text-xs tracking-wide uppercase font-medium mt-0.5">Host Portal</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-black/20">
            <h2 className="text-lg font-semibold text-stone-900 mb-1">Host Sign In</h2>
            <p className="text-stone-500 text-sm mb-6">
              Sign in to manage court sessions and scan players.
            </p>

            <form action={loginAction} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-stone-600 mb-1.5">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-stone-600 mb-1.5">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-colors"
                />
              </div>
              <ErrorMessage searchParams={searchParams} errorMessages={errorMessages} />
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Sign In as Host
              </button>
            </form>
          </div>

          <p className="text-center text-stone-500 text-sm mt-6">
            Are you a player?{" "}
            <a href="/login" className="text-amber-400 hover:text-amber-300 font-medium">
              Player sign in →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

async function ErrorMessage({
  searchParams,
  errorMessages,
}: {
  searchParams: Promise<{ error?: string }>;
  errorMessages: Record<string, string>;
}) {
  const { error } = await searchParams;
  if (!error || !errorMessages[error]) return null;
  return (
    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{errorMessages[error]}</p>
  );
}
