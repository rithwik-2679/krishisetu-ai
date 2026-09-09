/**
 * Deterministic Date/Time formatting utilities for KrishiSetu AI.
 * 
 * Prevents SSR / Client hydration mismatches caused by:
 * 1. Node.js vs Browser AM/PM capitalization (e.g., 'pm' vs 'PM')
 * 2. Node.js ICU narrow non-breaking spaces (\u202F) vs browser space
 * 3. Server vs client default locale and timezone differences
 * 
 * Uses Indian Standard Time (IST, UTC+05:30) as the reference standard for all farm/mandi timestamps.
 */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ParsedISTDate {
  day: string;
  month: string;
  year: number;
  hours: number;
  minutes: string;
  seconds: string;
  ampm: 'AM' | 'PM';
}

function parseISTComponents(input: string | number | Date | null | undefined): ParsedISTDate | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  const time = d.getTime();
  if (isNaN(time)) return null;

  // Offset UTC by +5.5 hours to produce deterministic IST values anywhere
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(time + IST_OFFSET_MS);

  const day = istDate.getUTCDate().toString().padStart(2, '0');
  const month = MONTHS_SHORT[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();

  const rawHours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  const seconds = istDate.getUTCSeconds().toString().padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const hours12 = rawHours % 12 || 12;

  return {
    day,
    month,
    year,
    hours: hours12,
    minutes,
    seconds,
    ampm,
  };
}

/**
 * Deterministic DateTime: "09 Sep 2026, 12:49 PM" (or with seconds if requested)
 */
export function formatDateTime(
  input: string | number | Date | null | undefined,
  includeSeconds = false
): string {
  const parts = parseISTComponents(input);
  if (!parts) return 'Not available';

  const timeStr = includeSeconds
    ? `${parts.hours}:${parts.minutes}:${parts.seconds} ${parts.ampm}`
    : `${parts.hours}:${parts.minutes} ${parts.ampm}`;

  return `${parts.day} ${parts.month} ${parts.year}, ${timeStr}`;
}

/**
 * Deterministic Date: "09 Sep 2026"
 */
export function formatDate(input: string | number | Date | null | undefined): string {
  const parts = parseISTComponents(input);
  if (!parts) return 'Not available';

  return `${parts.day} ${parts.month} ${parts.year}`;
}

/**
 * Deterministic Time: "12:49 PM"
 */
export function formatTime(input: string | number | Date | null | undefined): string {
  const parts = parseISTComponents(input);
  if (!parts) return '--:--';

  return `${parts.hours}:${parts.minutes} ${parts.ampm}`;
}
