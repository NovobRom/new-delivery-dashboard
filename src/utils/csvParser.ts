import Papa from 'papaparse';
import Fuse from 'fuse.js';
import { DeliveryRecord, DeliveryRecordSchema } from '../types/schema';

// ---------------------------------------------------------------------------
// Legacy mapping: CSV header (Ukrainian) → internal schema key.
// Used as a synonym dictionary to boost fuzzy matching accuracy.
// ---------------------------------------------------------------------------
const HEADER_MAPPING: Record<string, keyof DeliveryRecord> = {
    '№': 'id',
    'Дата відомості': 'date',
    'ПІБ кур\'єра': 'courierId',
    'Район (статичний/динамічний)': 'routeCode',
    'Номер відомості завантаження кур\'єра': 'documentNumber',
    'Місто одержувача': 'city',
    'Підрозділ відомості': 'department',
    'Номер ШК': 'barcode',
    'Кількість місць': 'qty',
    'Планова дата надходження (остання дата поставки) Shipment': 'plannedDate',
    'Дата доставки на дату відомості': 'executionDate',
    'Тип відправлення': 'type',
    'Фактична вага': 'weight',
    'Об\'ємна вага': 'volumetricWeight',
    'Країна одержувача': 'country',
    'Номер телефону одержувача': 'phone',
    'Тип одержувача': 'clientType',
    'Ім\'я одержувача': 'recipientName',
    'Адреса одержувача': 'address',
    'Статус доставки на дату відомості': 'status',
    'Час доставки на дату відомості': 'deliveryTime',
    'Розрахунковий час на доставку по Predict на дату відомості': 'interval',
    'Тип доставки': 'deliveryMethod',
    'Причина недоставки на дату відомості': 'reason',
    'Коментар з МК на дату відомості': 'comment',
    'SafePlace': 'safePlace',
    'SafePlace_UA': 'safePlace',
    'Номер Shipment': 'shipmentNumber',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserMapping = Record<string, keyof DeliveryRecord | ''>;

export interface CSVPreview {
    /** Original column names found in the CSV file */
    headers: string[];
    /** First 3–5 data rows as key→value maps (keys = original header names) */
    sampleRows: Record<string, string>[];
    /** Fuzzy-suggested mapping: CSV header → schema field ('' = no suggestion) */
    suggestedMapping: UserMapping;
    /** Detected file encoding */
    detectedEncoding: string;
    /** Detected column delimiter */
    detectedDelimiter: string;
}

export interface ParseResult {
    records: DeliveryRecord[];
    warnings: string[];
}

// ---------------------------------------------------------------------------
// Encoding auto-detection
// Read the first 4 bytes of the file to detect BOM markers.
// Falls back to UTF-8 which handles most modern CSVs.
// ---------------------------------------------------------------------------
async function detectEncoding(file: File): Promise<string> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const buf = e.target?.result as ArrayBuffer | null;
            if (!buf) return resolve('UTF-8');
            const bytes = new Uint8Array(buf.slice(0, 4));
            // UTF-16 LE BOM: FF FE
            if (bytes[0] === 0xff && bytes[1] === 0xfe) return resolve('UTF-16LE');
            // UTF-16 BE BOM: FE FF
            if (bytes[0] === 0xfe && bytes[1] === 0xff) return resolve('UTF-16BE');
            // UTF-8 BOM: EF BB BF
            if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return resolve('UTF-8');
            // Windows-1251 heuristic: high bytes in the first 512 chars with no BOM
            // (Cyrillic range 0xC0–0xFF is very common in 1251 files)
            const highBytes = Array.from(bytes).filter((b) => b >= 0xc0 && b <= 0xff);
            if (highBytes.length > 0) return resolve('Windows-1251');
            resolve('UTF-8');
        };
        reader.readAsArrayBuffer(file.slice(0, 512));
    });
}

// ---------------------------------------------------------------------------
// Delimiter auto-detection
// Count occurrences of common delimiters in the first line and pick the winner.
// ---------------------------------------------------------------------------
function detectDelimiter(firstLine: string): string {
    const candidates: Record<string, number> = {
        '\t': (firstLine.match(/\t/g) ?? []).length,
        ';': (firstLine.match(/;/g) ?? []).length,
        ',': (firstLine.match(/,/g) ?? []).length,
        '|': (firstLine.match(/\|/g) ?? []).length,
    };
    const winner = Object.entries(candidates).sort((a, b) => b[1] - a[1])[0];
    // If no delimiter found at all, default to comma
    return winner[1] > 0 ? winner[0] : ',';
}

// ---------------------------------------------------------------------------
// Fuzzy matching engine
// Builds a searchable list from the inverted HEADER_MAPPING (field → synonyms)
// and matches each CSV header against it.
// ---------------------------------------------------------------------------

// All valid schema fields
const ALL_SCHEMA_FIELDS = Object.keys(
    DeliveryRecordSchema.shape
) as (keyof DeliveryRecord)[];

// Invert HEADER_MAPPING: { schemaField: [synonym, synonym, ...] }
const FIELD_SYNONYMS: Record<string, string[]> = {};
for (const [header, field] of Object.entries(HEADER_MAPPING)) {
    if (!FIELD_SYNONYMS[field]) FIELD_SYNONYMS[field] = [];
    FIELD_SYNONYMS[field].push(header);
}

// Flat list for fuse: each item has a field key + all its synonym strings
interface FuseItem {
    field: keyof DeliveryRecord;
    terms: string[];  // field name itself + all synonyms
}

const fuseItems: FuseItem[] = ALL_SCHEMA_FIELDS.map((field) => ({
    field,
    terms: [field, ...(FIELD_SYNONYMS[field] ?? [])],
}));

const fuse = new Fuse(fuseItems, {
    keys: ['terms'],
    threshold: 0.40,   // 0 = exact match, 1 = match anything
    includeScore: true,
    useExtendedSearch: false,
    ignoreLocation: true,
    minMatchCharLength: 2,
});

/**
 * Returns the best-matching schema field for a CSV header string,
 * or '' if confidence is too low.
 */
function suggestField(csvHeader: string): keyof DeliveryRecord | '' {
    // 1. Try exact match from legacy mapping first (highest confidence)
    const exact = HEADER_MAPPING[csvHeader.trim()];
    if (exact) return exact;

    // 2. Fuzzy search
    const results = fuse.search(csvHeader.trim());
    if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.40) {
        return results[0].item.field;
    }
    return '';
}

/**
 * Builds a suggested mapping for all CSV headers.
 * Ensures no two headers map to the same field (first exact match wins).
 */
export function suggestMapping(headers: string[]): UserMapping {
    const used = new Set<string>();
    const mapping: UserMapping = {};

    for (const header of headers) {
        const suggestion = suggestField(header);
        if (suggestion && !used.has(suggestion)) {
            mapping[header] = suggestion;
            used.add(suggestion);
        } else {
            mapping[header] = '';
        }
    }
    return mapping;
}

// ---------------------------------------------------------------------------
// Preview — reads only the first 5 rows + headers
// ---------------------------------------------------------------------------
export async function previewCSV(file: File): Promise<CSVPreview> {
    const detectedEncoding = await detectEncoding(file);

    return new Promise((resolve, reject) => {
        // Step 1: read raw text to detect delimiter from first line
        const textReader = new FileReader();
        textReader.onload = (e) => {
            const text = (e.target?.result as string) ?? '';
            const firstLine = text.split(/\r?\n/)[0] ?? '';
            const detectedDelimiter = detectDelimiter(firstLine);

            // Step 2: parse with detected settings
            Papa.parse(file, {
                header: true,
                preview: 5,
                skipEmptyLines: true,
                encoding: detectedEncoding,
                delimiter: detectedDelimiter,
                complete: (results) => {
                    const headers = (results.meta.fields ?? []) as string[];
                    const sampleRows = results.data as Record<string, string>[];
                    const suggestedMapping = suggestMapping(headers);

                    resolve({
                        headers,
                        sampleRows,
                        suggestedMapping,
                        detectedEncoding,
                        detectedDelimiter,
                    });
                },
                error: reject,
            });
        };
        textReader.onerror = () => reject(new Error('Failed to read file'));
        textReader.readAsText(file, detectedEncoding);
    });
}

// ---------------------------------------------------------------------------
// Full parse — uses the mapping confirmed by the user in the Wizard UI
// ---------------------------------------------------------------------------
export async function parseCSV(
    file: File,
    userMapping: UserMapping,
    /** Optionally pass detected values from previewCSV to skip re-detection */
    options?: { encoding?: string; delimiter?: string }
): Promise<ParseResult> {
    const encoding = options?.encoding ?? await detectEncoding(file);

    return new Promise((resolve, reject) => {
        const textReader = new FileReader();
        textReader.onload = (e) => {
            const text = (e.target?.result as string) ?? '';
            const firstLine = text.split(/\r?\n/)[0] ?? '';
            const delimiter = options?.delimiter ?? detectDelimiter(firstLine);

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                encoding,
                delimiter,
                transformHeader: (header: string) => {
                    const clean = header.trim();
                    const mapped = userMapping[clean];
                    // Return the schema field name if mapped, else pass through untouched
                    return mapped || clean;
                },
                complete: (results) => {
                    const warnings: string[] = [];

                    if (results.errors.length > 0) {
                        warnings.push(`CSV parse warnings: ${results.errors.length} issue(s) detected`);
                    }

                    const records: DeliveryRecord[] = [];
                    let skippedCount = 0;

                    results.data.forEach((row: unknown, index: number) => {
                        const result = DeliveryRecordSchema.safeParse(row);
                        if (result.success) {
                            records.push(result.data);
                        } else {
                            skippedCount++;
                            if (skippedCount <= 3) {
                                warnings.push(
                                    `Row ${index + 1}: validation failed — ${result.error.issues.map((i) => i.message).join(', ')}`
                                );
                            }
                        }
                    });

                    if (skippedCount > 3) {
                        warnings.push(`...and ${skippedCount - 3} more rows skipped`);
                    }
                    if (skippedCount > 0) {
                        warnings.push(`Total: ${skippedCount} row(s) skipped due to validation errors`);
                    }

                    // Sanity check for critical columns
                    if (records.length > 0) {
                        const sample = records[0];
                        if (!sample.status && !sample.date) {
                            warnings.push(
                                'Warning: "status" and "date" columns appear empty — check column mapping'
                            );
                        }
                    }

                    resolve({ records, warnings });
                },
                error: reject,
            });
        };
        textReader.onerror = () => reject(new Error('Failed to read file'));
        textReader.readAsText(file, encoding);
    });
}
