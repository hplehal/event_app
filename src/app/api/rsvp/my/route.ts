import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/rsvp/my — Get the current user's RSVP event IDs. */
export async function GET(_request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rsvps = await prisma.rsvp.findMany({
    where: { userId: session.user.id },
    select: { eventId: true },
  });

  return NextResponse.json(rsvps.map((r) => r.eventId));
}
