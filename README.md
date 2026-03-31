# Tito's Courts — Court & Event Management

A full-stack **Progressive Web App (PWA)** for managing court bookings, league games, tournaments, and player check-ins at **Tito's Courts**. Players scan in via QR code, RSVP to upcoming sessions, and track their attendance. Court hosts manage sessions, monitor capacity, and pull comprehensive reports.

> **Tip:** For the best demo experience, open the player view on your computer (to display your QR code) and the host view on your phone (to scan it with the camera).

The app is pre-loaded with sample data — volleyball, basketball, tennis, and soccer sessions across the current week, plus 30 mock players with check-in and RSVP history — so you can explore all features immediately.

---

## How to Use

### As a Player

1. Sign in with **Google OAuth**.
2. After login you land on your **Dashboard** — today's sessions, what's happening now, weekly stats, and personalized "Featured For You" recommendations.
3. **RSVP** to upcoming sessions directly from the dashboard, calendar, or featured events. The RSVP button shows available spots (e.g. "3/12") and prevents overbooking.
4. Show your QR code to the court host when you arrive to check in.
5. **Add events to your calendar** — Google Calendar or download an .ics file for Apple/Outlook.
6. Use the navigation to explore:

| Section | What it does |
|---|---|
| **Dashboard** | Today's sessions, live events, starting soon, featured events based on your attendance history, weekly stats |
| **Calendar** | Weekly court schedule color-coded by sport, RSVP and check-in status, event details with RSVP button |
| **Attendance** | Full check-in history with date, event, and location |
| **Profile** | Your personal QR code, player code, and account info |

**Desktop:** sidebar navigation on the left.
**Mobile:** frosted-glass bottom tab bar.

---

### As a Host (Court Manager)

> **Demo credentials**
> **Email:** `tito@titoscourts.com`
> **Password:** `password123`
>
> **Alternate host:**
> **Email:** `maria@titoscourts.com`
> **Password:** `password123`

1. Sign in at `/host/login` with the credentials above.
2. You land on the **Scan** page — select the active court session and point the camera at a player's QR code to check them in.
3. If the camera isn't convenient, switch to the **Manual** tab and type in the 7-character code.

**Host portal sections:**

| Section | What it does |
|---|---|
| **Scan** | QR camera scanner + manual code entry. Auto-selects the current session. |
| **Events** | Browse sessions by day, filter by sport type, create new sessions with optional capacity limits. Shows RSVP and check-in counts per event. |
| **Reports** | Export an Excel workbook with 13 analytics sheets for any date range. |
| **Dashboard** | Overview stats — total sessions, check-ins, RSVPs. "RSVP vs Attendance" panel showing show rates per event. |

---

### RSVP & Capacity System

- **RSVP toggle** — players can RSVP to any upcoming event with one tap. Tap again to cancel.
- **Capacity limits** — hosts set an optional max capacity when creating events. Once full, new RSVPs are blocked ("Full" badge shown).
- **Show rate tracking** — hosts see how many RSVPs actually checked in, with percentage rates color-coded (green ≥70%, amber ≥40%, red <40%).
- **Overbooking prevention** — both RSVP and QR check-in enforce capacity limits.

---

### Court Session Types

| Type | Description |
|---|---|
| **Volleyball** | Indoor/outdoor volleyball games and scrimmages |
| **Basketball** | Full-court and half-court pickup games |
| **Tennis** | Singles, doubles, and round robin matches |
| **Soccer** | Indoor soccer and futsal sessions |
| **Tournament** | Organized competitive tournament brackets |
| **League** | Scheduled league nights (Mon–Sat) |
| **Open Court** | Drop-in free play, open gym time |
| **Other** | Awards nights, captain's meetings, socials |

---

### Excel Report Sheets

When you export from the Reports page, the `.xlsx` file includes 13 sheets:

| # | Sheet | Description |
|---|---|---|
| 1 | **Attendance Log** | Full audit trail — every check-in with timestamp, player details, event info, and minutes late |
| 2 | **All Events** | Every session with type, time, duration, location, host, capacity, RSVPs, check-ins, and RSVP show rate |
| 3 | **Player Directory** | All registered players with QR codes, all-time and in-period check-in counts |
| 4 | **By Event Type** | Stats per sport: sessions, check-ins, unique players, average per session |
| 5 | **By Location** | Court-level breakdown: sessions, check-ins, unique players |
| 6 | **By Day of Week** | Which days are busiest — sessions, check-ins, and averages |
| 7 | **By Hour of Day** | Peak hours analysis (6am–10pm) |
| 8 | **Top 10 Events** | Most attended sessions, ranked |
| 9 | **Top Players** | Top 20 most active players with sports played |
| 10 | **Daily Trend** | Day-by-day sessions, check-ins, and unique players |
| 11 | **RSVP Log** | Full log of all RSVPs — who signed up, for which event, and when |
| 12 | **RSVP vs Attendance** | Per-event comparison: RSVPs, showed up, no-shows, and show rate |
| 13 | **Summary** | High-level totals, averages, RSVP show rate, busiest day/location/type |

---

## Reusable Branding

The app is designed to be easily rebranded for any court or event company:

- **`src/lib/site-config.ts`** — Change the app name, tagline, and brand colors in one file
- **`src/components/brand/TitosLogo.tsx`** — Swap the SVG logo component
- **`src/lib/utils.ts`** — Edit `EVENT_TYPES` to change available sport/session types

---

## Project Structure

```
titos-courts/
├── prisma/
│   ├── schema.prisma        # Database schema (User, Host, Event, Attendance, Rsvp)
│   ├── seed.ts              # Seeds hosts, 30 mock players, sessions, and RSVPs
│   └── dev.db               # SQLite database (local dev)
│
├── src/
│   ├── app/
│   │   ├── (auth)/          # Public auth pages: /login, /host/login
│   │   ├── (user)/          # Player pages: dashboard, calendar, attendance, profile
│   │   ├── (host)/          # Host pages: scan, events, reports, dashboard
│   │   └── api/             # REST API routes (events, attendance, rsvp, reports, etc.)
│   │
│   ├── components/
│   │   ├── brand/           # TitosLogo reusable logo component
│   │   ├── auth/            # Login forms (player + host)
│   │   ├── events/          # Event cards, badges, weekly calendar, RSVP button, add-to-calendar
│   │   ├── dashboard/       # Stat cards
│   │   ├── scan/            # QR scanner (ZXing), manual code input
│   │   ├── profile/         # QR code display
│   │   ├── layout/          # Sidebar (desktop), bottom nav (mobile), host sidebar
│   │   └── ui/              # shadcn/ui base components
│   │
│   └── lib/
│       ├── site-config.ts   # Centralized branding (name, tagline, colors)
│       ├── auth.ts          # NextAuth config (Google OAuth)
│       ├── host-auth.ts     # JWT-based host session (jose)
│       ├── attendance.ts    # Check-in logic with capacity enforcement
│       ├── calendar-export.ts # .ics generation and Google Calendar URL builder
│       ├── excel.ts         # 13-sheet Excel report generator
│       ├── prisma.ts        # Prisma client singleton
│       └── utils.ts         # Timezone helpers, court/sport type constants
│
└── public/
    ├── icons/               # PWA icons (SVG + PNG)
    └── manifest.json        # PWA manifest
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Auth | NextAuth v5 — Google OAuth (players), JWT cookies (hosts) |
| Database | SQLite via Prisma + better-sqlite3 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| QR Scanning | ZXing browser library |
| QR Generation | react-qr-code |
| Excel Export | xlsx (SheetJS) |
| Calendar Export | .ics file generation + Google Calendar URL API |
| PWA | @ducanh2912/next-pwa |

---

## Running Locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed     # creates hosts, 30 mock players, court sessions, and RSVPs
npm run dev
```

Create a `.env.local` file with:

```env
AUTH_SECRET=your-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://<your-local-ip>:3000/api/auth/callback/google` (for testing on other devices)
4. Copy the Client ID and Secret into your `.env.local`

### Resetting the Database

```bash
npx prisma db push --force-reset
npm run seed
```
