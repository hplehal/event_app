import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** POST /api/rsvp — Toggle RSVP for an event (create or cancel). */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await request.json();
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required." }, { status: 400 });
  }

  const userId = session.user.id;

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { rsvps: true } } },
  });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // Check if user already has an RSVP
  const existing = await prisma.rsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing) {
    // Cancel RSVP
    await prisma.rsvp.delete({ where: { id: existing.id } });
    return NextResponse.json({ rsvped: false, rsvpCount: event._count.rsvps - 1 });
  }

  // Check capacity
  if (event.capacity && event._count.rsvps >= event.capacity) {
    return NextResponse.json(
      { error: "This event is full. No more spots available." },
      { status: 409 }
    );
  }

  // Check the event hasn't ended
  if (new Date(event.endTime) < new Date()) {
    return NextResponse.json(
      { error: "This event has already ended." },
      { status: 400 }
    );
  }

  // Create RSVP (P2002 guard for race conditions)
  try {
    await prisma.rsvp.create({ data: { userId, eventId } });
    return NextResponse.json({ rsvped: true, rsvpCount: event._count.rsvps + 1 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ rsvped: true, rsvpCount: event._count.rsvps });
    }
    throw err;
  }
}
