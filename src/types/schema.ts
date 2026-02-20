import { z } from 'zod';

// All fields optional with empty-string defaults.
// CSV rows may have missing columns — Zod won't reject them;
// instead missing values become '' which downstream code handles.
const optStr = z.string().optional().default('');

// Numeric field: accepts string or number from CSV, normalizes to number.
// Comma → dot, empty/garbage → 0.
const optNum = z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'number') return val;
        const num = parseFloat(val.replace(',', '.'));
        return isNaN(num) ? 0 : num;
    });

export const DeliveryRecordSchema = z.object({
    id: optStr,                    // №
    date: optStr,                  // Дата відомості
    courierId: optStr,             // Кур'єр
    routeCode: optStr,             // Маршрут
    documentNumber: optStr,        // Номер відомості
    city: optStr,                  // Місто одержувача
    department: optStr,            // Підрозділ відомості
    barcode: optStr,               // ШК
    secondBarcode: optStr,         // ШК2
    qty: optNum,                   // К-сть
    plannedDate: optStr,           // Дата план
    executionDate: optStr,         // Дата виконання
    city2: optStr,                 // Місто2
    date3: optStr,                 // Дата3
    refNumber: optStr,             // RefNumber
    date4: optStr,                 // Дата4
    type: optStr,                  // Тип
    weight: optNum,                // Вага
    volumetricWeight: optNum,      // Об'ємна вага
    volumetricWeight2: optNum,     // Об'ємна вага2
    country: optStr,               // Країна
    phone: optStr,                 // Телефон
    service: optStr,               // Service
    region: optStr,                // Region
    clientType: optStr,            // Тип клієнта
    phone2: optStr,                // Телефон2
    recipientName: optStr,         // Отримувач
    city3: optStr,                 // Місто3
    address: optStr,               // Адреса
    status: optStr,                // Статус
    deliveryTime: optStr,          // Час доставки
    interval: optStr,              // Інтервал
    deliveryMethod: optStr,        // Метод доставки
    isPaid: optStr,                // Сплачено
    isReturned: optStr,            // Повернення
    reason: optStr,                // Причина
    comment: optStr,               // Коментар
    safePlace: optStr,             // SafePlace
    shipmentNumber: optStr,        // Номер Shipment
});

export type DeliveryRecord = z.infer<typeof DeliveryRecordSchema>;

// Pickup schema — placeholder until real pickup fields are defined.
// Replace PickupRecordSchema body with actual pickup fields when available.
export const PickupRecordSchema = DeliveryRecordSchema;
export type PickupRecord = z.infer<typeof PickupRecordSchema>;

export const AppStateSchema = z.object({
    deliveries: z.array(DeliveryRecordSchema),
    pickups: z.array(PickupRecordSchema),
    lastUpdated: z.string().optional(),
});

export type AppState = z.infer<typeof AppStateSchema>;
