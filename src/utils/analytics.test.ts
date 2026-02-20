import { describe, it, expect } from 'vitest';
import { calculateKPIs } from './analytics';
import { DeliveryRecord } from '../types/schema';

describe('calculateKPIs', () => {

    it('returns zeroes for an empty array', () => {
        const result = calculateKPIs([]);
        expect(result).toEqual({
            totalDocs: 0,
            totalParcels: 0,
            deliveredCount: 0,
            deliveryRate: 0,
            onTimeCount: 0,
            onTimeRate: 0,
            uniqueCouriers: 0,
            uniqueRoutes: 0,
            efficiency: 0,
            handDeliveryCount: 0,
            safePlaceCount: 0,
            undeliveredCount: 0,
            noReasonCount: 0,
            undeliveredWithReason: 0,
            reasonsBreakdown: {}
        });
    });

    it('calculates metrics correctly for a mix of records', () => {
        const records = [
            {
                shipmentNumber: '1',
                type: 'Доставка',
                status: 'доставлено',
                executionDate: '01.03.2024',
                plannedDate: '01.03.2024',
                reason: '',
                deliveryMethod: 'В руки',
                safePlace: '',
                routeCode: 'R1',
                address: 'Address 1',
                city: 'Kyiv',
                weight: 1
            },
            {
                shipmentNumber: '2',
                type: 'Доставка',
                status: 'доставлено',
                executionDate: '01.03.2024',
                plannedDate: '02.03.2024', // Late
                reason: '',
                deliveryMethod: 'Консьєрж',
                safePlace: 'yes',
                courierId: 'C1',
                routeCode: 'R1',
                address: 'Address 2',
                city: 'Kyiv',
                weight: 2
            },
            {
                shipmentNumber: '3',
                type: 'Доставка',
                status: 'не доставлено',
                executionDate: '01.03.2024',
                plannedDate: '01.03.2024',
                reason: 'Клієнт відмовився',
                deliveryMethod: '',
                safePlace: '',
                courierId: 'C2',
                routeCode: 'R2',
                address: 'Address 3',
                city: 'Lviv',
                weight: 1
            },
            {
                shipmentNumber: '4',
                type: 'Доставка',
                status: 'не доставлено',
                executionDate: '01.03.2024',
                plannedDate: '01.03.2024',
                reason: '', // No reason
                deliveryMethod: '',
                safePlace: '',
                courierId: 'C2',
                routeCode: 'R2',
                address: 'Address 4',
                city: 'Lviv',
                weight: 1
            }
        ] as DeliveryRecord[];

        const result = calculateKPIs(records);

        expect(result.totalDocs).toBe(4);
        expect(result.totalParcels).toBe(4); // Same as totalDocs
        expect(result.deliveredCount).toBe(2);

        // 2 delivered out of 4 total
        expect(result.deliveryRate).toBe((2 / 4) * 100);

        // Only 1 is on time (executionDate matches plannedDate and status is delivered)
        expect(result.onTimeCount).toBe(1);
        expect(result.onTimeRate).toBe((1 / 4) * 100);

        expect(result.uniqueCouriers).toBe(2); // C1, C2
        expect(result.uniqueRoutes).toBe(2); // R1, R2

        // 4 total docs / 4 unique addresses
        expect(result.efficiency).toBe(1);

        expect(result.handDeliveryCount).toBe(1); // 'В руки'
        expect(result.safePlaceCount).toBe(1); // 'Консьєрж' matches safe place

        expect(result.undeliveredCount).toBe(2);
        expect(result.noReasonCount).toBe(1);
        expect(result.undeliveredWithReason).toBe(1);

        expect(result.reasonsBreakdown).toEqual({
            'Клієнт відмовився': 1
        });
    });

    it('calculates efficiency properly with duplicate addresses', () => {
        const records = [
            {
                shipmentNumber: '1',
                type: 'Доставка',
                status: 'доставлено',
                executionDate: '01.03.2024',
                plannedDate: '01.03.2024',
                reason: '',
                deliveryMethod: 'В руки',
                safePlace: '',
                courierId: 'C1',
                routeCode: 'R1',
                address: 'Address 1', // Same address
                city: 'Kyiv',
                weight: 1
            },
            {
                shipmentNumber: '2',
                type: 'Доставка',
                status: 'доставлено',
                executionDate: '01.03.2024',
                plannedDate: '01.03.2024',
                reason: '',
                deliveryMethod: 'В руки',
                safePlace: '',
                courierId: 'C1',
                routeCode: 'R1',
                address: 'Address 1', // Same address
                city: 'Kyiv',
                weight: 1
            }
        ] as DeliveryRecord[];

        const result = calculateKPIs(records);

        // efficiency = totalParcels (2) / uniqueAddresses (1)
        expect(result.efficiency).toBe(2);
    })
});
