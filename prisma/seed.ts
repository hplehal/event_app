import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { fromZonedTime } from "date-fns-tz";
import path from "path";

const TORONTO_TZ = "America/Toronto";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCode(): string {
  return Array.from({ length: 7 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

// ── Users — realistic mix of regulars and casual players ─────────────────────
const MOCK_USERS = [
  // Regulars (come most sessions)
  { name: "Marcus Rivera", email: "marcus.rivera@gmail.com" },
  { name: "Priya Sharma", email: "priya.sharma@outlook.com" },
  { name: "Tyler Okafor", email: "tyler.okafor@gmail.com" },
  { name: "Sofia Petrov", email: "sofia.petrov@yahoo.com" },
  { name: "Jamal Washington", email: "jamal.w@gmail.com" },
  { name: "Aisha Begum", email: "aisha.begum@hotmail.com" },
  { name: "Derek Nguyen", email: "derek.nguyen@gmail.com" },
  { name: "Camila Santos", email: "camila.santos@icloud.com" },
  // Semi-regulars
  { name: "Ryan Kowalski", email: "ryan.kowalski@gmail.com" },
  { name: "Jasmine Chen", email: "jasmine.chen@outlook.com" },
  { name: "Andre Baptiste", email: "andre.b@gmail.com" },
  { name: "Natasha Volkov", email: "natasha.v@yahoo.com" },
  { name: "Kevin Tremblay", email: "kevin.tremblay@gmail.com" },
  { name: "Fatima Hassan", email: "fatima.hassan@hotmail.com" },
  { name: "Lucas Moreau", email: "lucas.moreau@gmail.com" },
  { name: "Zara Patel", email: "zara.patel@icloud.com" },
  // Casual / drop-in
  { name: "Omar Diallo", email: "omar.diallo@gmail.com" },
  { name: "Emma Johansson", email: "emma.j@outlook.com" },
  { name: "Tomás García", email: "tomas.garcia@gmail.com" },
  { name: "Hannah Kim", email: "hannah.kim@yahoo.com" },
  { name: "Ravi Krishnan", email: "ravi.k@gmail.com" },
  { name: "Leah Thompson", email: "leah.thompson@hotmail.com" },
  { name: "Yuki Tanaka", email: "yuki.tanaka@gmail.com" },
  { name: "Carlos Medina", email: "carlos.medina@icloud.com" },
  { name: "Mei-Lin Wu", email: "meilin.wu@gmail.com" },
  { name: "Patrick O'Brien", email: "patrick.obrien@outlook.com" },
  { name: "Nia Campbell", email: "nia.campbell@gmail.com" },
  { name: "Alex Dubois", email: "alex.dubois@yahoo.com" },
  { name: "Sara Al-Farsi", email: "sara.alfarsi@gmail.com" },
  { name: "Jake Morrison", email: "jake.morrison@hotmail.com" },
];

// ── Event Templates ──────────────────────────────────────────────────────────

interface SessionTemplate {
  title: string;
  type: string;
  location: string;
  durationMin: number;
  /** Days of week this runs (0=Sun, 1=Mon, ..., 6=Sat). */
  days: number[];
  /** Start hour (Toronto time). */
  hour: number;
  /** Start minute. */
  minute: number;
  /** Probability that this session actually runs on a given scheduled day (simulates cancellations/off weeks). */
  probability: number;
  /** Max people for this session. */
  capacity: number;
}

// Realistic recurring schedule for a 2-court gym + 1 outdoor sand court
const RECURRING_SESSIONS: SessionTemplate[] = [
  // ── Monday ──
  { title: "Open Gym", type: "OPEN_COURT", location: "Main Gym", durationMin: 90, days: [1], hour: 7, minute: 0, probability: 0.6, capacity: 20 },
  { title: "Co-Ed Rec Volleyball", type: "VOLLEYBALL", location: "Court 1", durationMin: 90, days: [1], hour: 18, minute: 30, probability: 0.9, capacity: 12 },
  { title: "Monday Night League", type: "LEAGUE", location: "Court 1", durationMin: 120, days: [1], hour: 20, minute: 0, probability: 0.85, capacity: 16 },

  // ── Tuesday ──
  { title: "Beginner Tennis Clinic", type: "TENNIS", location: "Court 2", durationMin: 60, days: [2], hour: 10, minute: 0, probability: 0.7, capacity: 8 },
  { title: "Drop-In Basketball", type: "BASKETBALL", location: "Main Gym", durationMin: 120, days: [2], hour: 18, minute: 0, probability: 0.85, capacity: 14 },
  { title: "Sand Volleyball Open", type: "VOLLEYBALL", location: "Sand Court", durationMin: 90, days: [2], hour: 19, minute: 0, probability: 0.5, capacity: 10 },

  // ── Wednesday ──
  { title: "Indoor Soccer 5v5", type: "SOCCER", location: "Main Gym", durationMin: 90, days: [3], hour: 12, minute: 0, probability: 0.65, capacity: 10 },
  { title: "Competitive Volleyball", type: "VOLLEYBALL", location: "Court 1", durationMin: 120, days: [3], hour: 19, minute: 0, probability: 0.9, capacity: 12 },

  // ── Thursday ──
  { title: "Open Court Session", type: "OPEN_COURT", location: "Court 2", durationMin: 120, days: [4], hour: 9, minute: 0, probability: 0.5, capacity: 16 },
  { title: "Mixed 6s Volleyball", type: "VOLLEYBALL", location: "Court 1", durationMin: 90, days: [4], hour: 18, minute: 30, probability: 0.9, capacity: 12 },
  { title: "3-on-3 Basketball", type: "BASKETBALL", location: "Main Gym", durationMin: 90, days: [4], hour: 20, minute: 0, probability: 0.75, capacity: 12 },

  // ── Friday ──
  { title: "Friday Night League", type: "LEAGUE", location: "Court 1", durationMin: 120, days: [5], hour: 19, minute: 0, probability: 0.85, capacity: 16 },
  { title: "Drop-In Volleyball", type: "VOLLEYBALL", location: "Court 2", durationMin: 90, days: [5], hour: 19, minute: 0, probability: 0.7, capacity: 12 },

  // ── Saturday ──
  { title: "Morning Open Gym", type: "OPEN_COURT", location: "Main Gym", durationMin: 120, days: [6], hour: 8, minute: 0, probability: 0.8, capacity: 20 },
  { title: "Recreational Volleyball", type: "VOLLEYBALL", location: "Court 1", durationMin: 120, days: [6], hour: 10, minute: 0, probability: 0.85, capacity: 14 },
  { title: "Youth Basketball Training", type: "BASKETBALL", location: "Main Gym", durationMin: 90, days: [6], hour: 13, minute: 0, probability: 0.65, capacity: 12 },
  { title: "Doubles Tennis Round Robin", type: "TENNIS", location: "Court 2", durationMin: 90, days: [6], hour: 14, minute: 0, probability: 0.6, capacity: 8 },

  // ── Sunday (light day) ──
  { title: "Sunday Open Court", type: "OPEN_COURT", location: "Main Gym", durationMin: 120, days: [0], hour: 10, minute: 0, probability: 0.4, capacity: 16 },
  { title: "Futsal Drop-In", type: "SOCCER", location: "Main Gym", durationMin: 90, days: [0], hour: 15, minute: 0, probability: 0.35, capacity: 10 },
];

// One-off special events sprinkled into the calendar
const SPECIAL_EVENTS = [
  { title: "Tito's Volleyball Classic", type: "TOURNAMENT", location: "Court 1 & 2", durationMin: 300, hour: 9, minute: 0, capacity: 24 },
  { title: "Spring Smash Tournament", type: "TOURNAMENT", location: "Court 1", durationMin: 240, hour: 10, minute: 0, capacity: 20 },
  { title: "End-of-Season BBQ", type: "OTHER", location: "Patio Area", durationMin: 180, hour: 16, minute: 0, capacity: 40 },
  { title: "Captain's Meeting", type: "OTHER", location: "Meeting Room", durationMin: 60, hour: 19, minute: 0, capacity: 15 },
  { title: "Referee Training Session", type: "OTHER", location: "Court 2", durationMin: 90, hour: 11, minute: 0, capacity: 10 },
  { title: "Charity Fundraiser Game", type: "TOURNAMENT", location: "Main Gym", durationMin: 180, hour: 13, minute: 0, capacity: 30 },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function torontoToUTC(year: number, month: number, day: number, hour: number, minute: number): Date {
  const localStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  return fromZonedTime(localStr, TORONTO_TZ);
}

async function main() {
  console.log("Seeding database...");

  await prisma.rsvp.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.event.deleteMany();
  await prisma.host.deleteMany();
  await prisma.user.deleteMany();

  // ── Create Hosts ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);
  const host = await prisma.host.create({
    data: { name: "Tito Reyes", email: "tito@titoscourts.com", passwordHash },
  });
  await prisma.host.create({
    data: { name: "Maria Dos Santos", email: "maria@titoscourts.com", passwordHash },
  });
  console.log("Created 2 hosts");

  // ── Create Users ──────────────────────────────────────────────────────────
  const usedCodes = new Set<string>();
  const users = await Promise.all(
    MOCK_USERS.map((u) => {
      let code = generateCode();
      while (usedCodes.has(code)) code = generateCode();
      usedCodes.add(code);
      return prisma.user.create({
        data: { name: u.name, email: u.email, qrCode: code },
      });
    })
  );
  console.log(`Created ${users.length} users`);

  // Split users into attendance tiers
  const regulars = users.slice(0, 8);   // show up ~70% of the time
  const semiRegulars = users.slice(8, 16); // ~40%
  const casuals = users.slice(16);       // ~15%

  // ── Generate Events ───────────────────────────────────────────────────────
  const today = new Date();
  const todayToronto = new Date(today.toLocaleString("en-US", { timeZone: TORONTO_TZ }));
  todayToronto.setHours(0, 0, 0, 0);

  const startDate = new Date(todayToronto);
  startDate.setDate(startDate.getDate() - 42); // 6 weeks back

  const endDate = new Date(todayToronto);
  endDate.setDate(endDate.getDate() + 10); // ~1.5 weeks ahead

  const events: any[] = [];

  // Generate recurring sessions
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const dayOfWeek = cursor.getDay();

    for (const session of RECURRING_SESSIONS) {
      if (!session.days.includes(dayOfWeek)) continue;
      if (Math.random() > session.probability) continue; // skip — cancelled / off week

      const startUTC = torontoToUTC(
        cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate(),
        session.hour, session.minute
      );
      const endUTC = new Date(startUTC.getTime() + session.durationMin * 60 * 1000);

      events.push({
        title: session.title,
        type: session.type,
        startTime: startUTC,
        endTime: endUTC,
        location: session.location,
        capacity: session.capacity,
        hostId: host.id,
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Sprinkle in 4-6 special events over the date range
  const specialCount = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < specialCount; i++) {
    const daysFromStart = Math.floor(Math.random() * 49); // spread across ~7 weeks
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + daysFromStart);
    // Only on Saturday for tournaments / specials
    if (eventDate.getDay() === 0) eventDate.setDate(eventDate.getDate() + 6);
    else if (eventDate.getDay() < 5) eventDate.setDate(eventDate.getDate() + (6 - eventDate.getDay()));

    const special = SPECIAL_EVENTS[i % SPECIAL_EVENTS.length];
    const startUTC = torontoToUTC(
      eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate(),
      special.hour, special.minute
    );
    const endUTC = new Date(startUTC.getTime() + special.durationMin * 60 * 1000);

    events.push({
      title: special.title,
      type: special.type,
      startTime: startUTC,
      endTime: endUTC,
      location: special.location,
      capacity: special.capacity,
      hostId: host.id,
    });
  }

  for (let i = 0; i < events.length; i += 100) {
    await prisma.event.createMany({ data: events.slice(i, i + 100) });
  }
  const totalEvents = await prisma.event.count();
  console.log(`Created ${totalEvents} events`);

  // ── Generate Attendance Records ───────────────────────────────────────────
  const nowUTC = new Date();
  const pastEvents = await prisma.event.findMany({
    where: { startTime: { lt: nowUTC } },
    orderBy: { startTime: "asc" },
  });

  const userSchedule = new Map<string, Array<{ start: Date; end: Date }>>();
  let totalAttendances = 0;
  const attendanceBatch: any[] = [];

  for (const event of pastEvents) {
    // Build attendance list with realistic turnout per tier
    const attendees: typeof users = [];

    for (const u of regulars) {
      if (Math.random() < 0.65) attendees.push(u);
    }
    for (const u of semiRegulars) {
      if (Math.random() < 0.35) attendees.push(u);
    }
    for (const u of casuals) {
      if (Math.random() < 0.12) attendees.push(u);
    }

    // Filter out scheduling conflicts
    const eligible = attendees.filter((u) => {
      const schedule = userSchedule.get(u.id) ?? [];
      return !schedule.some((slot) => slot.start < event.endTime && slot.end > event.startTime);
    });

    // Cap at realistic gym capacity (4-14 people per session)
    const maxAttendees = 4 + Math.floor(Math.random() * 11);
    const selected = shuffle(eligible).slice(0, maxAttendees);

    for (const user of selected) {
      const windowMs = event.endTime.getTime() - event.startTime.getTime();
      const arrivalWindow = Math.min(windowMs * 0.3, 15 * 60 * 1000); // arrive in first 15 min
      const randomOffset = Math.floor(Math.random() * arrivalWindow);
      const scannedAt = new Date(event.startTime.getTime() + randomOffset);

      attendanceBatch.push({
        userId: user.id,
        eventId: event.id,
        scannedBy: host.id,
        scannedAt,
      });

      const schedule = userSchedule.get(user.id) ?? [];
      schedule.push({ start: event.startTime, end: event.endTime });
      userSchedule.set(user.id, schedule);
      totalAttendances++;
    }
  }

  // Batch insert attendance for performance
  for (let i = 0; i < attendanceBatch.length; i += 100) {
    await prisma.attendance.createMany({ data: attendanceBatch.slice(i, i + 100) });
  }

  console.log(`Created ${totalAttendances} attendance records`);

  // ── Generate RSVP Records ─────────────────────────────────────────────────
  // RSVPs are for upcoming events + some past events (to show show-rate data)
  const allEventsForRsvp = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(nowUTC.getTime() - 14 * 24 * 60 * 60 * 1000), // last 2 weeks + future
      },
    },
    orderBy: { startTime: "asc" },
  });

  const rsvpBatch: any[] = [];
  const rsvpSeen = new Set<string>();

  for (const event of allEventsForRsvp) {
    const cap = event.capacity ?? 12;
    const rsvpPool: typeof users = [];

    // Regulars RSVP more often
    for (const u of regulars) {
      if (Math.random() < 0.7) rsvpPool.push(u);
    }
    for (const u of semiRegulars) {
      if (Math.random() < 0.4) rsvpPool.push(u);
    }
    for (const u of casuals) {
      if (Math.random() < 0.15) rsvpPool.push(u);
    }

    // Cap RSVPs to capacity
    const rsvpers = shuffle(rsvpPool).slice(0, cap);

    for (const user of rsvpers) {
      const key = `${user.id}_${event.id}`;
      if (rsvpSeen.has(key)) continue;
      rsvpSeen.add(key);

      // RSVP created 1-3 days before event start
      const daysBefore = 1 + Math.floor(Math.random() * 3);
      const createdAt = new Date(event.startTime.getTime() - daysBefore * 24 * 60 * 60 * 1000);

      rsvpBatch.push({
        userId: user.id,
        eventId: event.id,
        createdAt,
      });
    }
  }

  for (let i = 0; i < rsvpBatch.length; i += 100) {
    await prisma.rsvp.createMany({ data: rsvpBatch.slice(i, i + 100) });
  }

  console.log(`Created ${rsvpBatch.length} RSVP records`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
