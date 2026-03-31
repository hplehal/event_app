import { NextRequest, NextResponse } from "next/server";
import { getHostSession } from "@/lib/host-auth";
import { prisma } from "@/lib/prisma";

/** POST /api/rsvp/drop — Host removes a player's RSVP (no-show / drop). */
export async function POST(request: NextRequest) {
  const hostSession = await getHostSession(request);
  if (!hostSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, eventId } = await request.json();
  if (!userId || !eventId) {
    return NextResponse.json({ error: "userId and eventId are required." }, { status: 400 });
  }

  const rsvp = await prisma.rsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!rsvp) {
    return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
  }

  await prisma.rsvp.delete({ where: { id: rsvp.id } });

  return NextResponse.json({ success: true });
}
