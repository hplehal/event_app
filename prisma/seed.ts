import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { fromZonedTime } from "date-fns-tz";
import path from "path";

const TORONTO_TZ = "America/Toronto";

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

// Short 7-char code from unambiguous chars (no 0/O/1/I/L)
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generateCode(): string {
  return Array.from({ length: 7 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

// ── Mock Users ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { name: "Alice Johnson", email: "alice.johnson@example.com" },
  { name: "Bob Martinez", email: "bob.martinez@example.com" },
  { name: "Carol Williams", email: "carol.williams@example.com" },
  { name: "David Chen", email: "david.chen@example.com" },
  { name: "Emma Davis", email: "emma.davis@example.com" },
  { name: "Frank Thompson", email: "frank.thompson@example.com" },
  { name: "Grace Lee", email: "grace.lee@example.com" },
  { name: "Henry Wilson", email: "henry.wilson@example.com" },
  { name: "Iris Rodriguez", email: "iris.rodriguez@example.com" },
  { name: "James Brown", email: "james.brown@example.com" },
  { name: "Karen White", email: "karen.white@example.com" },
  { name: "Liam Taylor", email: "liam.taylor@example.com" },
  { name: "Mia Anderson", email: "mia.anderson@example.com" },
  { name: "Noah Jackson", email: "noah.jackson@example.com" },
  { name: "Olivia Harris", email: "olivia.harris@example.com" },
  { name: "Peter Clark", email: "peter.clark@example.com" },
  { name: "Quinn Lewis", email: "quinn.lewis@example.com" },
  { name: "Rachel Walker", email: "rachel.walker@example.com" },
  { name: "Samuel Hall", email: "samuel.hall@example.com" },
  { name: "Tina Allen", email: "tina.allen@example.com" },
  { name: "Uma Young", email: "uma.young@example.com" },
  { name: "Victor King", email: "victor.king@example.com" },
  { name: "Wendy Scott", email: "wendy.scott@example.com" },
  { name: "Xavier Green", email: "xavier.green@example.com" },
  { name: "Yara Adams", email: "yara.adams@example.com" },
];

// ── Event Titles per Type ─────────────────────────────────────────────────────
const EVENT_TITLES: Record<string, string[]> = {
  VOLLEYBALL: [
    "Mixed 6s Volleyball",
    "Co-Ed Beach Volleyball",
    "Competitive Volleyball",
    "Recreational Volleyball",
    "Drop-In Volleyball",
    "Advanced Volleyball Scrimmage",
    "Beginner Volleyball Clinic",
    "Sand Volleyball Open",
    "Indoor Volleyball League Game",
    "Volleyball Skills & Drills",
  ],
  BASKETBALL: [
    "5-on-5 Basketball",
    "3-on-3 Basketball Tournament",
    "Drop-In Basketball",
    "Recreational Basketball",
    "Competitive Basketball League",
    "Basketball Skills Clinic",
    "Half-Court Pickup Games",
    "Youth Basketball Training",
  ],
  TENNIS: [
    "Singles Tennis Match",
    "Doubles Tennis Round Robin",
    "Tennis Clinic",
    "Drop-In Tennis",
    "Advanced Tennis Drill Session",
    "Beginner Tennis Lesson",
    "Mixed Doubles Tennis",
  ],
  SOCCER: [
    "Indoor Soccer 5v5",
    "Co-Ed Soccer League",
    "Futsal Drop-In",
    "Recreational Soccer",
    "Competitive Soccer Match",
    "Youth Soccer Training",
    "Soccer Skills Session",
  ],
  TOURNAMENT: [
    "Tito's Volleyball Classic",
    "Spring Smash Tournament",
    "Weekend Warriors Tournament",
    "Co-Ed Mixed Tournament",
    "Championship Playoff",
    "All-Star Invitational",
    "Summer Slam Series",
  ],
  LEAGUE: [
    "Monday Night League",
    "Tuesday Co-Ed League",
    "Wednesday Competitive League",
    "Thursday Rec League",
    "Friday Night League",
    "Saturday Morning League",
    "Weekend Warriors League",
  ],
  OPEN_COURT: [
    "Open Gym",
    "Free Play Court Time",
    "Open Court Session",
    "Community Free Play",
    "Walk-In Court Rental",
  ],
  OTHER: [
    "Awards Night",
    "Season Kickoff Party",
    "Team Registration Night",
    "End-of-Season BBQ",
    "Charity Fundraiser Game",
    "Referee Training Session",
    "Captain's Meeting",
  ],
};

const TYPE_POOL = [
  ...Array(14).fill("VOLLEYBALL"),
  ...Array(8).fill("BASKETBALL"),
  ...Array(6).fill("TENNIS"),
  ...Array(6).fill("SOCCER"),
  ...Array(4).fill("TOURNAMENT"),
  ...Array(5).fill("LEAGUE"),
  ...Array(4).fill("OPEN_COURT"),
  ...Array(3).fill("OTHER"),
];

const LOCATIONS = [
  "Court 1", "Court 2", "Court 3", "Court 4",
  "Sand Court A", "Sand Court B",
  "Main Gym", "Auxiliary Gym",
  "Tennis Court 1", "Tennis Court 2",
  "Indoor Field", "Outdoor Field",
  "Community Center Gym", "Rooftop Court",
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

  await prisma.attendance.deleteMany();
  await prisma.event.deleteMany();
  await prisma.host.deleteMany();
  await prisma.user.deleteMany();

  // ── Create Host ───────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);
  const host = await prisma.host.create({
    data: { name: "Admin Host", email: "host@example.com", passwordHash },
  });
  console.log(`Created host: ${host.email}`);

  // ── Create Users with short codes ─────────────────────────────────────────
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

  // ── Generate Events ───────────────────────────────────────────────────────
  const today = new Date();
  const todayToronto = new Date(today.toLocaleString("en-US", { timeZone: TORONTO_TZ }));
  todayToronto.setHours(0, 0, 0, 0);

  const startDate = new Date(todayToronto);
  startDate.setDate(startDate.getDate() - 35);

  const endDate = new Date(todayToronto);
  endDate.setDate(endDate.getDate() + 7);

  const events: any[] = [];

  // ── Special: today at 05:00 Toronto for testing attendance ────────────────
  const todayAt5Start = torontoToUTC(
    todayToronto.getFullYear(),
    todayToronto.getMonth() + 1,
    todayToronto.getDate(),
    5, 0
  );
  const todayAt5End = new Date(todayAt5Start.getTime() + 60 * 60 * 1000); // 1h
  events.push({
    title: "Early Bird Open Gym - 05:00",
    type: "OPEN_COURT",
    startTime: todayAt5Start,
    endTime: todayAt5End,
    location: "Main Gym",
    hostId: host.id,
  });

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek !== 0) {
      const slots: { hour: number; minute: number }[] = [];
      for (let hour = 8; hour <= 20; hour++) {
        slots.push({ hour, minute: 0 });
        slots.push({ hour, minute: 20 });
        slots.push({ hour, minute: 40 });
      }
      slots.push({ hour: 9, minute: 10 });

      for (const slot of slots) {
        const type = pickRandom(TYPE_POOL);
        const title = pickRandom(EVENT_TITLES[type]);
        const startUTC = torontoToUTC(
          cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate(),
          slot.hour, slot.minute
        );
        const endUTC = new Date(startUTC.getTime() + 50 * 60 * 1000);
        events.push({
          title: `${title} - ${slot.hour.toString().padStart(2, "0")}:${slot.minute.toString().padStart(2, "0")}`,
          type, startTime: startUTC, endTime: endUTC,
          location: pickRandom(LOCATIONS), hostId: host.id,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
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

  for (const event of pastEvents) {
    const eligibleUsers = users.filter((u) => {
      const schedule = userSchedule.get(u.id) ?? [];
      return !schedule.some((slot) => slot.start < event.endTime && slot.end > event.startTime);
    });

    const count = Math.min(eligibleUsers.length, Math.floor(Math.random() * 20) + 1);
    const selected = shuffle(eligibleUsers).slice(0, count);

    for (const user of selected) {
      const windowMs = event.endTime.getTime() - event.startTime.getTime();
      const randomOffset = Math.floor(Math.random() * windowMs * 0.9);
      const scannedAt = new Date(event.startTime.getTime() + randomOffset);

      await prisma.attendance.create({
        data: { userId: user.id, eventId: event.id, scannedBy: host.id, scannedAt },
      });

      const schedule = userSchedule.get(user.id) ?? [];
      schedule.push({ start: event.startTime, end: event.endTime });
      userSchedule.set(user.id, schedule);
      totalAttendances++;
    }
  }

  console.log(`Created ${totalAttendances} attendance records`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
