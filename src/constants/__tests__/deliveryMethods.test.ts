import { describe, it, expect } from 'vitest';
import { isHandDelivery, isSafePlace, isSafePlaceColumn, normalizeMethodName } from '../deliveryMethods';

describe('isHandDelivery', () => {
    it('detects English "hand" keyword', () => {
        expect(isHandDelivery('Hand Delivery')).toBe(true);
        expect(isHandDelivery('hand delivery to recipient')).toBe(true);
    });

    it('detects Ukrainian "руки" keyword', () => {
        expect(isHandDelivery('В руки')).toBe(true);
        expect(isHandDelivery('Доставка в руки отримувачу')).toBe(true);
    });

    it('returns false for non-hand methods', () => {
        expect(isHandDelivery('Post Office')).toBe(false);
        expect(isHandDelivery('Safe Place')).toBe(false);
        expect(isHandDelivery('')).toBe(false);
    });

    it('handles undefined', () => {
        expect(isHandDelivery(undefined)).toBe(false);
    });
});

describe('isSafePlaceColumn', () => {
    it('detects "yes", "1", "true"', () => {
        expect(isSafePlaceColumn('yes')).toBe(true);
        expect(isSafePlaceColumn('1')).toBe(true);
        expect(isSafePlaceColumn('true')).toBe(true);
        expect(isSafePlaceColumn('YES')).toBe(true);
    });

    it('rejects "no", "N/A", random strings', () => {
        expect(isSafePlaceColumn('no')).toBe(false);
        expect(isSafePlaceColumn('N/A')).toBe(false);
        expect(isSafePlaceColumn('none')).toBe(false);
        expect(isSafePlaceColumn('maybe')).toBe(false);
    });

    it('handles undefined and empty', () => {
        expect(isSafePlaceColumn(undefined)).toBe(false);
        expect(isSafePlaceColumn('')).toBe(false);
    });
});

describe('isSafePlace', () => {
    it('detects by method keyword', () => {
        expect(isSafePlace('Safe Place Delivery', undefined)).toBe(true);
        expect(isSafePlace('безпечне місце', undefined)).toBe(true);
    });

    it('detects by column value', () => {
        expect(isSafePlace('Hand Delivery', 'yes')).toBe(true);
        expect(isSafePlace('Unknown', '1')).toBe(true);
    });

    it('returns false when neither matches', () => {
        expect(isSafePlace('Hand Delivery', 'no')).toBe(false);
        expect(isSafePlace('Post Office', undefined)).toBe(false);
    });
});

describe('normalizeMethodName', () => {
    it('normalizes hand delivery variants', () => {
        expect(normalizeMethodName('Hand delivery', undefined)).toBe('Hand Delivery');
        expect(normalizeMethodName('В руки', undefined)).toBe('Hand Delivery');
    });

    it('normalizes safe place variants', () => {
        expect(normalizeMethodName('safe place', undefined)).toBe('Safe Place');
        // When method name contains 'post', it takes priority over safePlace column
        expect(normalizeMethodName('Unknown method', 'yes')).toBe('Safe Place');
    });

    it('normalizes post office', () => {
        expect(normalizeMethodName('Post Office pickup', undefined)).toBe('Post Office');
    });

    it('preserves unknown methods', () => {
        expect(normalizeMethodName('Courier Express', undefined)).toBe('Courier Express');
    });

    it('defaults to "Unknown" for empty', () => {
        expect(normalizeMethodName('', undefined)).toBe('Unknown');
        expect(normalizeMethodName(undefined, undefined)).toBe('Unknown');
    });
});
