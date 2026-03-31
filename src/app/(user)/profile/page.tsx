import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User, LogOut } from "lucide-react";

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Desktop: side-by-side / Mobile: stacked */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* QR Code — first and prominent */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center gap-3">
          <QRCodeDisplay value={user.qrCode} size={240} />
          <p className="text-xs text-stone-400 text-center">
            Show this to the host to register your attendance
          </p>
        </div>

        {/* Right side — user info + actions */}
        <div className="space-y-5">
          {/* User info */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 shrink-0">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-stone-100 text-lg">
                  {user.name?.charAt(0) ?? <User size={24} />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-stone-900 truncate">{user.name}</p>
                <p className="flex items-center gap-1.5 text-sm text-stone-500 truncate">
                  <Mail size={13} />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* QR Code value */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-2">Your Player Code</p>
            <p className="text-2xl font-mono font-bold text-stone-900 tracking-widest">{user.qrCode}</p>
            <p className="text-xs text-stone-400 mt-1">Hosts can also enter this code manually</p>
          </div>

          {/* Logout — only visible on mobile since desktop has sidebar logout */}
          <form action={logoutAction} className="md:hidden">
            <button type="submit" className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-200 text-red-600 text-sm font-medium bg-white">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
