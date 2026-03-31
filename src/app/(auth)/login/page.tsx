import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { TitosLogo } from "@/components/brand/TitosLogo";
import { siteConfig } from "@/lib/site-config";

interface Props {
  searchParams: Promise<{ verify?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { verify } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TitosLogo size={64} />
          </div>
          <h1 className="text-2xl font-bold text-white">{siteConfig.name}</h1>
          <p className="text-amber-400/70 text-sm mt-1">{siteConfig.tagline}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-amber-900/10">
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Sign in</h2>
          <p className="text-stone-500 text-sm mb-6">
            Sign in to view courts, events, and check-ins.
          </p>
          <UserLoginForm verifyMode={verify === "1"} />
        </div>

        {/* Host link */}
        <p className="text-center text-stone-400 text-sm mt-6">
          Are you a host?{" "}
          <a href="/host/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Host sign in →
          </a>
        </p>
      </div>
    </div>
  );
}
