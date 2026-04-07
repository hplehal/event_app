import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Shield, LogOut, QrCode, Lightbulb } from "lucide-react";

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
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <Avatar className="w-14 h-14 shrink-0 ring-2 ring-stone-200 ring-offset-2">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-lg font-bold">
            {user.name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-stone-900 truncate">{user.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-stone-500 truncate">
            <Mail size={13} />
            {user.email}
          </p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* QR Code card */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-4">
            <QrCode size={15} className="text-amber-500" />
            Your QR Code
          </div>
          <QRCodeDisplay value={user.qrCode} size={200} />
          <p className="text-xs text-stone-400 text-center max-w-[220px] mt-4">
            Show this to the host when you arrive at the court
          </p>
        </div>

        {/* Player info */}
        <div className="space-y-4">
          {/* Player code */}
          <div className="bg-white border border-stone-200/60 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Shield size={15} className="text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-stone-900">Player Code</p>
            </div>
            <div className="bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3">
              <p className="text-xl font-mono font-bold text-stone-900 tracking-[0.2em]">{user.qrCode}</p>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">For manual check-in when scanning isn't available</p>
          </div>

          {/* Tip card */}
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Lightbulb size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Quick tip</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">Save a screenshot of your QR code for faster check-ins at the court.</p>
            </div>
          </div>

          {/* Logout — mobile only */}
          <form action={logoutAction} className="md:hidden">
            <button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl border border-stone-200 text-stone-500 text-sm font-medium bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
              <LogOut size={15} />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
