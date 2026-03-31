import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Shield, LogOut, QrCode } from "lucide-react";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, image: true, qrCode: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Hero profile header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900/40 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,166,35,0.12)_0%,_transparent_50%)]" />
        <div className="relative flex items-center gap-4 md:gap-6">
          <Avatar className="w-16 h-16 md:w-20 md:h-20 shrink-0 ring-4 ring-white/20 shadow-lg">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xl md:text-2xl font-bold">
              {user.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-extrabold text-white truncate">{user.name}</h1>
            <p className="flex items-center gap-1.5 text-sm text-stone-300 truncate mt-1">
              <Mail size={13} />
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* QR Code card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-1">
            <QrCode size={16} className="text-amber-500" />
            Your QR Code
          </div>
          <QRCodeDisplay value={user.qrCode} size={220} />
          <p className="text-xs text-stone-400 text-center max-w-[240px]">
            Show this QR code to the host when you arrive at the court
          </p>
        </div>

        {/* Player info */}
        <div className="space-y-5">
          {/* Player code */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-stone-900">Player Code</p>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
              <p className="text-2xl font-mono font-extrabold text-stone-900 tracking-[0.2em]">{user.qrCode}</p>
            </div>
            <p className="text-xs text-stone-400 mt-2">Hosts can enter this code manually if scanning isn't available</p>
          </div>

          {/* Quick stats placeholder */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5">
            <p className="text-sm font-semibold text-amber-900 mb-1">Player tip</p>
            <p className="text-xs text-amber-700">Keep your QR code screenshot saved for quick check-ins. You can also download it using the button above.</p>
          </div>

          {/* Logout — mobile only */}
          <form action={logoutAction} className="md:hidden">
            <button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-600 text-sm font-medium bg-white hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
