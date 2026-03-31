import { siteConfig } from "@/lib/site-config";

interface CalEventData {
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  location?: string | null;
  description?: string;
}

/**
 * Generate an .ics (iCalendar) file content string for an event.
 * Works with Google Calendar, Apple Calendar, Outlook, etc.
 */
export function generateICS(event: CalEventData): string {
  const start = formatICSDate(new Date(event.startTime));
  const end = formatICSDate(new Date(event.endTime));
  const now = formatICSDate(new Date());
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@${siteConfig.shortName.toLowerCase().replace(/[^a-z]/g, "")}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteConfig.name}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Generate a Google Calendar URL for an event.
 */
export function generateGoogleCalendarURL(event: CalEventData): string {
  const start = formatGoogleDate(new Date(event.startTime));
  const end = formatGoogleDate(new Date(event.endTime));

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });

  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Trigger a download of an .ics file.
 */
export function downloadICS(event: CalEventData): void {
  const ics = generateICS(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Format date as ICS timestamp (UTC): 20260331T180000Z */
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Format date for Google Calendar URL: 20260331T180000Z */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape special characters for ICS format */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
