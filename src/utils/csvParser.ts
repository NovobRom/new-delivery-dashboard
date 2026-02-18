import Papa from 'papaparse';
import { DeliveryRecord, DeliveryRecordSchema } from '../types/schema';

// Mapping from CSV Ukrainian headers to our internal schema keys
const HEADER_MAPPING: Record<string, keyof DeliveryRecord> = {
    '№': 'id',
    'Дата відомості': 'date',
    'ПІБ кур\'єра': 'courierId',
    'Район (статичний/динамічний)': 'routeCode',
    'Номер відомості завантаження кур\'єра': 'documentNumber',
    'Місто одержувача': 'city',
    'Номер ШК': 'barcode',
    // 'ШК2': 'secondBarcode', // Not present
    'Кількість місць': 'qty',
    'Планова дата надходження (остання дата поставки) Shipment': 'plannedDate',
    'Дата доставки на дату відомості': 'executionDate',
    // 'Місто2': 'city2',
    // 'Дата3': 'date3',
    // 'RefNumber': 'refNumber',
    // 'Дата4': 'date4',
    'Тип відправлення': 'type',
    'Фактична вага': 'weight',
    'Об\'ємна вага': 'volumetricWeight',
    // 'Об\'ємна вага2': 'volumetricWeight2',
    'Країна одержувача': 'country',
    'Номер телефону одержувача': 'phone',
    // 'Service': 'service',
    // 'Region': 'region',
    'Тип одержувача': 'clientType',
    // 'Телефон2': 'phone2',
    'Ім\'я одержувача': 'recipientName',
    // 'Місто3': 'city3',
    'Адреса одержувача': 'address',
    'Статус доставки на дату відомості': 'status', // Critical fix
    'Час доставки на дату відомості': 'deliveryTime',
    'Розрахунковий час на доставку по Predict на дату відомості': 'interval',
    'Тип доставки': 'deliveryMethod',
    // 'Сплачено': 'isPaid',
    // 'Повернення': 'isReturned',
    'Причина недоставки на дату відомості': 'reason',
    'Коментар з МК на дату відомості': 'comment',
    'SafePlace': 'safePlace',
    'SafePlace_UA': 'safePlace',
    'Номер Shipment': 'shipmentNumber',
};

export interface ParseResult {
    records: DeliveryRecord[];
    warnings: string[];
}

export const parseCSV = (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-16LE', // Crucial for this file
            delimiter: '\t',      // Crucial for this file
            transformHeader: (header: string) => {
                const cleanHeader = header.trim();
                return HEADER_MAPPING[cleanHeader] || cleanHeader;
            },
            complete: (results) => {
                const warnings: string[] = [];

                if (results.errors.length > 0) {
                    warnings.push(`CSV parse warnings: ${results.errors.length} issue(s) detected`);
                }

                // Validate each row against the Zod schema
                const records: DeliveryRecord[] = [];
                let skippedCount = 0;

                results.data.forEach((row: unknown, index: number) => {
                    const result = DeliveryRecordSchema.safeParse(row);
                    if (result.success) {
                        records.push(result.data);
                    } else {
                        skippedCount++;
                        if (skippedCount <= 3) {
                            warnings.push(`Row ${index + 1}: validation failed — ${result.error.issues.map(i => i.message).join(', ')}`);
                        }
                    }
                });

                if (skippedCount > 3) {
                    warnings.push(`...and ${skippedCount - 3} more rows skipped`);
                }

                if (skippedCount > 0) {
                    warnings.push(`Total: ${skippedCount} row(s) skipped due to validation errors`);
                }

                // Check if critical columns were mapped
                if (records.length > 0) {
                    const sample = records[0];
                    if (!sample.status && !sample.date) {
                        warnings.push('Warning: "status" and "date" columns appear empty — CSV header mapping may be incorrect');
                    }
                }

                resolve({ records, warnings });
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
