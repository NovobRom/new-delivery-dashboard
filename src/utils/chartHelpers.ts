import { DeliveryRecord } from '@/types/schema';
import { parse, isValid } from 'date-fns';

const parseDate = (dateStr: string) => {
    if (!dateStr) return null;

    // Normalize separator to dots (handle both / and -)
    const normalized = dateStr.replace(/[\/\-]/g, '.');

    // Try parsing dd.MM.yyyy
    const parsed = parse(normalized, 'dd.MM.yyyy', new Date());

    if (isValid(parsed)) return parsed;
    return null;
};

export const prepareTrendData = (records: DeliveryRecord[]) => {
    const grouped: Record<string, { date: string; total: number; delivered: number }> = {};

    records.forEach((r) => {
        const dateKey = r.date || 'Unknown';
        if (!grouped[dateKey]) {
            grouped[dateKey] = { date: dateKey, total: 0, delivered: 0 };
        }

        grouped[dateKey].total += 1; // Count every row as loaded parsel

        const status = r.status?.toLowerCase() || '';
        if (status === 'доставлено') {
            grouped[dateKey].delivered += 1;
        }
    });

    return Object.values(grouped).sort((a, b) => {
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);

        if (dateA && dateB) {
            return dateA.getTime() - dateB.getTime();
        }
        return a.date.localeCompare(b.date);
    });
};

export const prepareRegionalData = (records: DeliveryRecord[]) => {
    const grouped: Record<string, { name: string; delivered: number; total: number }> = {};

    records.forEach((r) => {
        // Use Route Code as the region/subdivision identifier
        const region = r.routeCode || 'Unknown';

        if (!grouped[region]) {
            grouped[region] = { name: region, delivered: 0, total: 0 };
        }
        grouped[region].total += 1;

        const status = r.status?.toLowerCase() || '';
        if (status === 'доставлено') {
            grouped[region].delivered += 1;
        }
    });

    return Object.values(grouped)
        .map(item => ({
            name: item.name,
            successRate: item.total > 0 ? parseFloat(((item.delivered / item.total) * 100).toFixed(1)) : 0,
            loaded: item.total,
            delivered: item.delivered
        }))
        .sort((a, b) => b.successRate - a.successRate); // Sort by Success Rate descending
};

export const prepareMethodData = (records: DeliveryRecord[]) => {
    const grouped: Record<string, number> = {};

    records.forEach((r) => {
        // Handle "Safe Place" unification
        // Check both 'deliveryMethod' and 'safePlace' column
        let method = r.deliveryMethod || 'Unknown';

        // Normalize names for better display
        if (method.toLowerCase().includes('hand')) method = 'Hand Delivery';
        else if (method.toLowerCase().includes('post')) method = 'Post Office';
        else if (method.toLowerCase().includes('safe')) method = 'Safe Place';

        // If safePlace calculation logic in analytics.ts suggests specific overrides, we should respect that,
        // but for this chart, we usually visualize the 'deliveryMethod' field distribution. 
        // However, if the user explicitly wants "Safe Place" visibility which might be hidden in other methods:
        const isSafePlaceCol = r.safePlace === 'yes' || r.safePlace === '1' || r.safePlace === 'true';
        if (isSafePlaceCol) {
            method = 'Safe Place';
        }

        grouped[method] = (grouped[method] || 0) + 1;
    });

    return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
};

export interface CourierHeatmapData {
    courier: string;
    dates: Record<string, { loaded: number; delivered: number; rate: number }>;
    totalVolume: number;
}

export const prepareCourierData = (records: DeliveryRecord[]) => {
    const courierMap: Record<string, CourierHeatmapData> = {};
    const allDates = new Set<string>();

    records.forEach((r) => {
        const id = r.courierId || 'Unknown';
        const date = r.date || 'Unknown';
        allDates.add(date);

        if (!courierMap[id]) {
            courierMap[id] = { courier: id, dates: {}, totalVolume: 0 };
        }

        if (!courierMap[id].dates[date]) {
            courierMap[id].dates[date] = { loaded: 0, delivered: 0, rate: 0 };
        }

        courierMap[id].totalVolume += 1;
        courierMap[id].dates[date].loaded += 1;

        if (r.status?.toLowerCase() === 'доставлено') {
            courierMap[id].dates[date].delivered += 1;
        }
    });

    // Calculate rates
    Object.values(courierMap).forEach(c => {
        Object.values(c.dates).forEach(d => {
            d.rate = d.loaded > 0 ? parseFloat(((d.delivered / d.loaded) * 100).toFixed(1)) : 0;
        });
    });

    // Sort dates properly
    const sortedDates = Array.from(allDates).sort((a, b) => {
        const dateA = parseDate(a);
        const dateB = parseDate(b);
        if (dateA && dateB) return dateA.getTime() - dateB.getTime();
        return a.localeCompare(b);
    });

    // Sort couriers by total volume
    const sortedCouriers = Object.values(courierMap).sort((a, b) => b.totalVolume - a.totalVolume);

    return {
        couriers: sortedCouriers,
        dates: sortedDates
    };
};

export const prepareDensityData = (records: DeliveryRecord[]) => {
    const grouped: Record<string, { date: string; loaded: number; addresses: Set<string> }> = {};

    records.forEach((r) => {
        const dateKey = r.date || 'Unknown';
        if (!grouped[dateKey]) {
            grouped[dateKey] = { date: dateKey, loaded: 0, addresses: new Set() };
        }
        grouped[dateKey].loaded += 1;
        if (r.address) {
            grouped[dateKey].addresses.add(r.address);
        }
    });

    return Object.values(grouped)
        .map(item => ({
            date: item.date,
            loaded: item.loaded,
            addresses: item.addresses.size,
            density: item.addresses.size > 0 ? (item.loaded / item.addresses.size).toFixed(2) : '0'
        }))
        .sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            if (dateA && dateB) {
                return dateA.getTime() - dateB.getTime();
            }
            return a.date.localeCompare(b.date);
        });
};
