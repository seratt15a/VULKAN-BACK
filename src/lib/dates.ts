/** Converts a Prisma @db.Date value back to the 'YYYY-MM-DD' string the frontend expects. */
export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses a 'YYYY-MM-DD' string into a Date safe for a @db.Date column (no timezone shift). */
export function parseDateStr(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
