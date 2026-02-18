import { describe, it, expect } from 'vitest';
import { calculateKPIs } from '../analytics';
import { DeliveryRecord } from '../../types/schema';

function makeRecord(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
    return {
        id: '1', date: '01.02.2025', courierId: 'C1', routeCode: 'R1',
        documentNumber: '', city: '', barcode: '', secondBarcode: '',
        qty: '1', plannedDate: '01.02.2025', executionDate: '01.02.2025',
        city2: '', date3: '', refNumber: '', date4: '', type: '',
        weight: '1', volumetricWeight: '', volumetricWeight2: '',
        country: '', phone: '', service: '', region: '',
        clientType: '', phone2: '', recipientName: '',
        city3: '', address: 'Address 1',
        status: 'доставлено', deliveryTime: '', interval: '',
        deliveryMethod: '', isPaid: '', isReturned: '',
        reason: '', comment: '', safePlace: '', shipmentNumber: '',
        ...overrides,
    };
}

describe('calculateKPIs', () => {
    it('returns zeros for empty records', () => {
        const kpis = calculateKPIs([]);
        expect(kpis.totalDocs).toBe(0);
        expect(kpis.totalParcels).toBe(0);
        expect(kpis.deliveredCount).toBe(0);
        expect(kpis.deliveryRate).toBe(0);
    });

    it('counts delivered records', () => {
        const records = [
            makeRecord({ status: 'доставлено' }),
            makeRecord({ status: 'доставлено' }),
            makeRecord({ status: 'не доставлено', reason: 'Адреса не знайдена' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.totalParcels).toBe(3);
        expect(kpis.deliveredCount).toBe(2);
        expect(kpis.deliveryRate).toBeCloseTo(66.7, 0);
    });

    it('counts on-time deliveries using date parsing', () => {
        const records = [
            makeRecord({ executionDate: '01.02.2025', plannedDate: '01.02.2025' }),
            makeRecord({ executionDate: '02.02.2025', plannedDate: '01.02.2025' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.onTimeCount).toBe(1);
    });

    it('does not count as on-time when plannedDate is missing', () => {
        const records = [
            makeRecord({ executionDate: '01.02.2025', plannedDate: '' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.onTimeCount).toBe(0);
    });

    it('counts hand delivery methods', () => {
        const records = [
            makeRecord({ deliveryMethod: 'Hand Delivery' }),
            makeRecord({ deliveryMethod: 'В руки' }),
            makeRecord({ deliveryMethod: 'Post Office' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.handDeliveryCount).toBe(2);
    });

    it('counts safe place correctly (no false positives from length check)', () => {
        const records = [
            makeRecord({ deliveryMethod: 'Safe Place', safePlace: '' }),
            makeRecord({ deliveryMethod: 'Hand', safePlace: 'yes' }),
            makeRecord({ deliveryMethod: 'Hand', safePlace: 'no' }),   // Should NOT count
            makeRecord({ deliveryMethod: 'Hand', safePlace: 'N/A' }),  // Should NOT count
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.safePlaceCount).toBe(2);
    });

    it('separates undelivered with/without reason', () => {
        const records = [
            makeRecord({ status: 'не доставлено', reason: 'Закрито' }),
            makeRecord({ status: 'не доставлено', reason: 'Закрито' }),
            makeRecord({ status: 'не доставлено', reason: '' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.undeliveredWithReason).toBe(2);
        expect(kpis.noReasonCount).toBe(1);
        expect(kpis.undeliveredCount).toBe(3);
        expect(kpis.reasonsBreakdown['Закрито']).toBe(2);
    });

    it('counts unique couriers and routes', () => {
        const records = [
            makeRecord({ courierId: 'C1', routeCode: 'R1' }),
            makeRecord({ courierId: 'C2', routeCode: 'R1' }),
            makeRecord({ courierId: 'C1', routeCode: 'R2' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.uniqueCouriers).toBe(2);
        expect(kpis.uniqueRoutes).toBe(2);
    });

    it('calculates efficiency (parcels / unique addresses)', () => {
        const records = [
            makeRecord({ address: 'Addr1' }),
            makeRecord({ address: 'Addr1' }),
            makeRecord({ address: 'Addr2' }),
        ];
        const kpis = calculateKPIs(records);
        expect(kpis.efficiency).toBe(1.5); // 3 / 2
    });
});
