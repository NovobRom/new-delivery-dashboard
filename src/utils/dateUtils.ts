import { parse, isValid } from 'date-fns';

/**
 * Parse a date string in dd.MM.yyyy format (also handles / and - separators).
 * Returns null if the string is empty or unparseable.
 */
export function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  const normalized = dateStr.trim().replace(/[/-]/g, '.');
  const parsed = parse(normalized, 'dd.MM.yyyy', new Date());

  return isValid(parsed) ? parsed : null;
}

/**
 * Compare two date strings by their calendar day (ignores formatting differences).
 * Returns true if both resolve to the same date. Returns false if either is unparseable.
 */
export function isSameDay(
  dateA: string | undefined,
  dateB: string | undefined,
): boolean {
  const a = parseDate(dateA);
  const b = parseDate(dateB);
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

/**
 * Sort comparator for date strings. Unparseable dates sort to the end.
 */
export function compareDates(a: string, b: string): number {
  const dateA = parseDate(a);
  const dateB = parseDate(b);

  if (dateA && dateB) return dateA.getTime() - dateB.getTime();
  if (dateA) return -1;
  if (dateB) return 1;
  return a.localeCompare(b);
}
