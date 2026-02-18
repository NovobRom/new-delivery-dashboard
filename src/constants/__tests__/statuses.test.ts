import { describe, it, expect } from 'vitest';
import { isDelivered, isUndelivered } from '../statuses';

describe('isDelivered', () => {
    it('returns true for "доставлено"', () => {
        expect(isDelivered('доставлено')).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(isDelivered('Доставлено')).toBe(true);
        expect(isDelivered('ДОСТАВЛЕНО')).toBe(true);
    });

    it('trims whitespace', () => {
        expect(isDelivered('  доставлено  ')).toBe(true);
    });

    it('returns false for other statuses', () => {
        expect(isDelivered('не доставлено')).toBe(false);
        expect(isDelivered('в обробці')).toBe(false);
        expect(isDelivered('')).toBe(false);
    });

    it('handles undefined gracefully', () => {
        expect(isDelivered(undefined)).toBe(false);
    });
});

describe('isUndelivered', () => {
    it('returns true for "не доставлено"', () => {
        expect(isUndelivered('не доставлено')).toBe(true);
    });

    it('is case-insensitive', () => {
        expect(isUndelivered('Не Доставлено')).toBe(true);
    });

    it('trims whitespace', () => {
        expect(isUndelivered(' не доставлено ')).toBe(true);
    });

    it('returns false for delivered status', () => {
        expect(isUndelivered('доставлено')).toBe(false);
    });

    it('handles undefined gracefully', () => {
        expect(isUndelivered(undefined)).toBe(false);
    });
});
