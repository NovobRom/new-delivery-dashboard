import { describe, it, expect } from 'vitest';
import { parseDate, isSameDay, compareDates } from '../dateUtils';

describe('parseDate', () => {
    it('parses dd.MM.yyyy format', () => {
        const result = parseDate('15.02.2025');
        expect(result).not.toBeNull();
        expect(result!.getDate()).toBe(15);
        expect(result!.getMonth()).toBe(1); // February = 1 (0-indexed)
        expect(result!.getFullYear()).toBe(2025);
    });

    it('handles / separator', () => {
        const result = parseDate('15/02/2025');
        expect(result).not.toBeNull();
        expect(result!.getDate()).toBe(15);
    });

    it('handles - separator', () => {
        const result = parseDate('15-02-2025');
        expect(result).not.toBeNull();
        expect(result!.getDate()).toBe(15);
    });

    it('returns null for empty string', () => {
        expect(parseDate('')).toBeNull();
    });

    it('returns null for undefined', () => {
        expect(parseDate(undefined)).toBeNull();
    });

    it('returns null for invalid date', () => {
        expect(parseDate('not-a-date')).toBeNull();
    });
});

describe('isSameDay', () => {
    it('returns true for identical dates', () => {
        expect(isSameDay('15.02.2025', '15.02.2025')).toBe(true);
    });

    it('returns true for same date in different formats', () => {
        expect(isSameDay('15.02.2025', '15/02/2025')).toBe(true);
        expect(isSameDay('15-02-2025', '15.02.2025')).toBe(true);
    });

    it('returns false for different dates', () => {
        expect(isSameDay('15.02.2025', '16.02.2025')).toBe(false);
    });

    it('returns false when either is unparseable', () => {
        expect(isSameDay('15.02.2025', '')).toBe(false);
        expect(isSameDay(undefined, '15.02.2025')).toBe(false);
    });
});

describe('compareDates', () => {
    it('sorts earlier dates first', () => {
        expect(compareDates('01.02.2025', '15.02.2025')).toBeLessThan(0);
        expect(compareDates('15.02.2025', '01.02.2025')).toBeGreaterThan(0);
    });

    it('returns 0 for same dates', () => {
        expect(compareDates('15.02.2025', '15.02.2025')).toBe(0);
    });

    it('falls back to string comparison for unparseable dates', () => {
        expect(compareDates('abc', 'def')).toBeLessThan(0);
    });
});
