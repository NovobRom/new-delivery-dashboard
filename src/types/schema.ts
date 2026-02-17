import { z } from 'zod';

// Define the raw schema based on the CSV columns (45 columns)
// We will refine this as we understand the data better.
// Using loose string types for now to ensure parsing succeeds.
export const DeliveryRecordSchema = z.object({
    id: z.string(), // №
    date: z.string(), // Дата відомості
    courierId: z.string(), // Кур'єр
    routeCode: z.string(), // Маршрут
    documentNumber: z.string(), // Номер відомості
    city: z.string(), // Місто
    barcode: z.string(), // ШК
    secondBarcode: z.string().optional(), // ШК2
    qty: z.string(), // К-сть
    plannedDate: z.string(), // Дата план
    executionDate: z.string(), // Дата виконання
    city2: z.string(), // Місто2
    date3: z.string(), // Дата3
    refNumber: z.string(), // RefNumber
    date4: z.string(), // Дата4
    type: z.string(), // Тип
    weight: z.string(), // Вага
    volumetricWeight: z.string(), // Об'ємна вага
    volumetricWeight2: z.string(), // Об'ємна вага2
    country: z.string(), // Країна
    phone: z.string(), // Телефон
    service: z.string(), // Service
    region: z.string(), // Region
    clientType: z.string(), // Тип клієнта
    phone2: z.string(), // Телефон2
    recipientName: z.string(), // Отримувач
    city3: z.string(), // Місто3
    address: z.string(), // Адреса
    status: z.string(), // Статус
    deliveryTime: z.string(), // Час доставки
    interval: z.string(), // Інтервал
    deliveryMethod: z.string(), // Метод доставки
    isPaid: z.string(), // Сплачено

    isReturned: z.string(), // Повернення
    reason: z.string().optional(), // Причина
    comment: z.string().optional(), // Коментар
    safePlace: z.string().optional(), // SafePlace
    shipmentNumber: z.string().optional(), // Номер Shipment
    // Add more fields if needed based on the 45 columns
});

export type DeliveryRecord = z.infer<typeof DeliveryRecordSchema>;

export const AppStateSchema = z.object({
    records: z.array(DeliveryRecordSchema),
    lastUpdated: z.string().optional(),
});

export type AppState = z.infer<typeof AppStateSchema>;
