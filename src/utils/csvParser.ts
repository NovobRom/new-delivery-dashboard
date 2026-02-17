import Papa from 'papaparse';
import { DeliveryRecord } from '../types/schema';

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

export const parseCSV = (file: File): Promise<DeliveryRecord[]> => {
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
                if (results.errors.length > 0) {
                    console.warn('CSV Parse Warnings:', results.errors);
                }

                // Validate and shape data
                const safeData = results.data.map((row: any) => {
                    // Basic data mapping validation could happen here
                    return row;
                });

                resolve(safeData as DeliveryRecord[]);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
