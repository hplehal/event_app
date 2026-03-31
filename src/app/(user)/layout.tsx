import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/layout/UserNav";
import { AttendancePoller } from "@/components/attendance/AttendancePoller";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <UserNav userName={session.user.name ?? undefined} userEmail={session.user.email ?? undefined} />
      <main className="pb-20 md:pb-0 md:ml-64 min-h-screen">{children}</main>
      <AttendancePoller userName={session.user.name ?? undefined} />
    </div>
  );
}
