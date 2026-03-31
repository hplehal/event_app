# Tito's Courts — Court & Event Management

A full-stack **Progressive Web App (PWA)** for managing court bookings, league games, tournaments, and player check-ins at **Tito's Courts**. Players scan in via QR code, court hosts manage sessions and pull reports.

> **Tip:** For the best demo experience, open the player view on your computer (to display your QR code) and the host view on your phone (to scan it with the camera).

The app is pre-loaded with sample data — volleyball, basketball, tennis, and soccer sessions across the current week, plus 25 mock players with check-in history — so you can explore all features immediately.

---

## How to Use

### As a Player

1. Sign in with Google or a magic link sent to your email.
2. After login you land on your **QR Code** page — a unique 7-character code tied to your account.
3. Show the QR code to the court host when you arrive to check in to a session.
4. Use the bottom navigation to explore:
   - **Profile** — your personal QR code
   - **Calendar** — weekly court schedule, color-coded by sport, with your check-ins marked
   - **Attendance** — full check-in history
   - **Dashboard** — today's sessions, what's happening now, and weekly stats

---

### As a Host (Court Manager)

> **Demo credentials**
> **Email:** `host@example.com`
> **Password:** `password123`

1. Sign in at `/host/login` with the credentials above.
2. You land on the **Scan** page — select the active court session and point the camera at a player's QR code to check them in.
3. If the camera isn't convenient, switch to the **Manual** tab and type in the 7-character code.

**Host portal sections:**

| Section | What it does |
|---|---|
| **Scan** | QR camera scanner + manual code entry. Auto-selects the current session. |
| **Events** | Browse court sessions by day, filter by sport type, create new sessions. |
| **Reports** | Export an Excel workbook with 6 analytics sheets for any date range. |
| **Dashboard** | Overview stats — total sessions, check-ins, most popular courts. |

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

When you export from the Reports page, the `.xlsx` file includes:

1. **All Events** — every court session in the date range with player count
2. **By Event Type** — totals per sport (Volleyball, Basketball, Tennis, etc.)
3. **By Day of Week** — check-in distribution Mon–Sat
4. **By Hour of Day** — hourly distribution to identify peak court times
5. **Top 10 Events** — the 10 most attended sessions in the period
6. **Daily Trend** — total check-ins per calendar day

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
│   ├── schema.prisma        # Database schema (User, Host, Event, Attendance)
│   ├── seed.ts              # Seeds hosts, 25 mock players, and court sessions
│   └── dev.db               # SQLite database (local dev)
│
├── src/
│   ├── app/
│   │   ├── (auth)/          # Public auth pages: /login, /host/login
│   │   ├── (user)/          # Player pages: profile, calendar, attendance, dashboard
│   │   ├── (host)/          # Host pages: scan, events, reports, dashboard
│   │   └── api/             # REST API routes
│   │
│   ├── components/
│   │   ├── brand/           # TitosLogo reusable logo component
│   │   ├── auth/            # Login forms (player + host)
│   │   ├── events/          # Event cards, badges, weekly calendar
│   │   ├── scan/            # QR scanner (ZXing), manual code input
│   │   ├── profile/         # QR code display
│   │   ├── layout/          # Bottom nav (player), sidebar (host)
│   │   └── ui/              # shadcn/ui base components
│   │
│   └── lib/
│       ├── site-config.ts   # Centralized branding (name, tagline, colors)
│       ├── auth.ts          # NextAuth config (Google + magic link)
│       ├── host-auth.ts     # JWT-based host session (jose)
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
| Auth | NextAuth v5 — Google OAuth + Resend magic link (players), JWT cookies (hosts) |
| Database | SQLite via Prisma + better-sqlite3 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| QR Scanning | ZXing browser library |
| QR Generation | react-qr-code |
| Excel Export | xlsx (SheetJS) |
| Email | Resend |
| PWA | @ducanh2912/next-pwa |

---

## Running Locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed     # creates hosts, 25 mock players, and court sessions
npm run dev
```

Create a `.env.local` file with:

```env
AUTH_SECRET=your-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```
