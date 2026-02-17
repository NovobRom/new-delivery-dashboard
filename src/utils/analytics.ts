import { DeliveryRecord } from '../types/schema';

export interface DashboardKPIs {
    totalDocs: number;
    totalParcels: number; // Formerly unique shipments, now same as totalDocs per user request
    deliveredCount: number;
    deliveryRate: number; // Percentage
    onTimeCount: number;
    onTimeRate: number; // Percentage
    uniqueCouriers: number;
    uniqueRoutes: number;
    efficiency: number; // Loaded / Unique Addresses
    handDeliveryCount: number;
    safePlaceCount: number;
    undeliveredCount: number;
    noReasonCount: number;
    undeliveredWithReason: number;
    reasonsBreakdown: Record<string, number>;
}

export const calculateKPIs = (records: DeliveryRecord[]): DashboardKPIs => {
    const totalDocs = records.length;
    // User requested to treat "Total Loaded" as total rows, same as backup.
    // So distinct shipment logic is removed for these metrics.
    const totalParcels = totalDocs;

    if (totalDocs === 0) {
        return {
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
        };
    }

    const couriers = new Set<string>();
    const routes = new Set<string>();
    const uniqueAddresses = new Set<string>();
    const reasonsBreakdown: Record<string, number> = {};

    let deliveredOnDateCount = 0;
    let onTimeCount = 0;
    let handDeliveryCount = 0;
    let safePlaceCount = 0;
    let noReasonCount = 0;
    let undeliveredWithReasonCount = 0;

    records.forEach(r => {
        if (r.courierId) couriers.add(r.courierId);
        if (r.routeCode) routes.add(r.routeCode);
        if (r.address) uniqueAddresses.add(r.address);

        const statusLower = r.status?.toLowerCase() || '';
        // Strict check: Only "доставлено" calculates as successful delivery on date
        const isDelivered = statusLower === 'доставлено';

        if (isDelivered) {
            deliveredOnDateCount++;

            // On Time Check
            if (r.executionDate && r.plannedDate && r.executionDate === r.plannedDate) {
                onTimeCount++;
            } else {
                if (!r.plannedDate) onTimeCount++;
            }
        } else if (statusLower === 'не доставлено') {
            // Not Delivered Logic based on column "Статус доставки на дату відомості"
            // If "не доставлено", check reason in "Причина недоставки на дату відомості"
            const reason = r.reason?.trim();

            if (reason && reason.length > 0) {
                // Reason exists -> Undelivered with reason
                undeliveredWithReasonCount++;
                reasonsBreakdown[reason] = (reasonsBreakdown[reason] || 0) + 1;
            } else {
                // Reason is empty -> Undelivered without reason (No Reason)
                noReasonCount++;
            }
        }

        // Methods
        const methodLower = r.deliveryMethod?.toLowerCase() || '';
        const safePlaceVal = r.safePlace?.toLowerCase() || '';

        // Hand Delivery
        if (methodLower.includes('hand') || methodLower.includes('руки') || methodLower.includes('в руки')) {
            handDeliveryCount++;
        }

        // SafePlace logic: check method OR specific column
        const isSafePlaceMethod = methodLower.includes('safe') || methodLower.includes('безпечн');
        const isSafePlaceCol = safePlaceVal === 'yes' || safePlaceVal === '1' || safePlaceVal === 'true' || safePlaceVal.length > 1;

        if (isSafePlaceMethod || isSafePlaceCol) {
            safePlaceCount++;
        }
    });

    // Success Rate based on Delivered on Date
    const successRate = totalParcels > 0 ? (deliveredOnDateCount / totalParcels) * 100 : 0;

    return {
        totalDocs,
        totalParcels,
        deliveredCount: deliveredOnDateCount, // Mapped to existing generic name for compatibility
        deliveryRate: parseFloat(successRate.toFixed(1)),
        onTimeCount,
        onTimeRate: totalParcels > 0 ? parseFloat(((onTimeCount / totalParcels) * 100).toFixed(1)) : 0,
        uniqueCouriers: couriers.size,
        uniqueRoutes: routes.size,
        efficiency: uniqueAddresses.size > 0 ? parseFloat((totalParcels / uniqueAddresses.size).toFixed(2)) : 0,
        handDeliveryCount,
        safePlaceCount,
        undeliveredCount: undeliveredWithReasonCount + noReasonCount, // Total Undelivered
        noReasonCount,
        undeliveredWithReason: undeliveredWithReasonCount,
        reasonsBreakdown
    };
};
