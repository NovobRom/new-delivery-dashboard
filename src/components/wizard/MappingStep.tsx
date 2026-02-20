import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeliveryRecord, DeliveryRecordSchema } from '../../types/schema';
import { UserMapping, CSVPreview } from '../../utils/csvParser';
import { Button } from '../ui/Button';
import { ChevronLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

// All valid schema field names as plain strings for <select> options
const SCHEMA_FIELDS: string[] = Object.keys(DeliveryRecordSchema.shape);

// Human-readable labels for schema fields
const FIELD_LABELS: Partial<Record<keyof DeliveryRecord, string>> = {
    id: '№ (id)',
    date: 'Дата відомості (date)',
    courierId: 'Кур\'єр (courierId)',
    routeCode: 'Маршрут (routeCode)',
    documentNumber: 'Номер відомості (documentNumber)',
    city: 'Місто (city)',
    department: 'Підрозділ (department)',
    barcode: 'ШК (barcode)',
    secondBarcode: 'ШК2 (secondBarcode)',
    qty: 'Кількість (qty)',
    plannedDate: 'Дата план (plannedDate)',
    executionDate: 'Дата виконання (executionDate)',
    type: 'Тип (type)',
    weight: 'Вага (weight)',
    volumetricWeight: 'Об\'ємна вага (volumetricWeight)',
    country: 'Країна (country)',
    phone: 'Телефон (phone)',
    clientType: 'Тип клієнта (clientType)',
    recipientName: 'Отримувач (recipientName)',
    address: 'Адреса (address)',
    status: 'Статус ✱ (status)',
    deliveryTime: 'Час доставки (deliveryTime)',
    interval: 'Інтервал (interval)',
    deliveryMethod: 'Метод доставки (deliveryMethod)',
    reason: 'Причина (reason)',
    comment: 'Коментар (comment)',
    safePlace: 'SafePlace (safePlace)',
    shipmentNumber: 'Номер Shipment (shipmentNumber)',
};

// Fields that are strongly recommended to be mapped
const RECOMMENDED_FIELDS: (keyof DeliveryRecord)[] = ['date', 'status', 'courierId'];

interface MappingStepProps {
    preview: CSVPreview;
    onBack: () => void;
    onConfirm: (mapping: UserMapping) => void;
}

export function MappingStep({ preview, onBack, onConfirm }: MappingStepProps) {
    const { t } = useTranslation();
    const [mapping, setMapping] = useState<UserMapping>({ ...preview.suggestedMapping });

    const updateField = (csvHeader: string, value: string) => {
        setMapping((prev: UserMapping) => ({ ...prev, [csvHeader]: value as keyof DeliveryRecord | '' }));
    };

    // Check which recommended fields are unmapped
    const mappedValues = Object.values(mapping).filter(Boolean);
    const missingRecommended = RECOMMENDED_FIELDS.filter((f) => !mappedValues.includes(f));

    // Sample value for a header from the first data row
    const getSample = (header: string): string => {
        const val = preview.sampleRows[0]?.[header];
        return val ? String(val) : '—';
    };

    return (
        <div className="w-full space-y-4">
            {/* Info bar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{preview.headers.length}</span>
                    {' '}колонок знайдено •{' '}
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {preview.detectedEncoding}
                    </span>
                    {' '}•{' '}
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                        {preview.detectedDelimiter === '\t' ? 'TAB' : preview.detectedDelimiter}
                    </span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Sparkles size={12} />
                    {t('wizard.autoMapped')}
                </div>
            </div>

            {/* Missing recommended fields warning */}
            {missingRecommended.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>
                        {t('wizard.requiredMissing', { fields: missingRecommended.join(', ') })}
                    </span>
                </div>
            )}

            {/* Mapping table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1.2fr] bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>{t('wizard.csvColumn')}</span>
                    <span>{t('wizard.exampleValue')}</span>
                    <span>{t('wizard.systemField')}</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[340px] overflow-y-auto">
                    {preview.headers.map((header) => {
                        const currentVal = mapping[header] ?? '';
                        const isAutoMapped = preview.suggestedMapping[header] !== '' && preview.suggestedMapping[header] != null;

                        return (
                            <div
                                key={header}
                                className="grid grid-cols-[1fr_1fr_1.2fr] items-center px-4 py-2.5 gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                {/* CSV column name */}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={header}>
                                        {header}
                                    </p>
                                    {isAutoMapped && (
                                        <span className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
                                            <Sparkles size={9} />
                                            {t('wizard.autoMapped')}
                                        </span>
                                    )}
                                </div>

                                {/* Sample value */}
                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono" title={getSample(header)}>
                                    {getSample(header)}
                                </p>

                                {/* System field select */}
                                <select
                                    value={currentVal}
                                    onChange={(e) => updateField(header, e.target.value)}
                                    className={clsx(
                                        'w-full rounded-md border px-2 py-1.5 text-sm transition-colors outline-none',
                                        'bg-white dark:bg-slate-900',
                                        'focus:ring-2 focus:ring-brand-red focus:border-brand-red',
                                        currentVal
                                            ? 'border-emerald-400 dark:border-emerald-600 text-slate-800 dark:text-slate-100'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                                    )}
                                >
                                    <option value="">{t('wizard.skip')}</option>
                                    {SCHEMA_FIELDS.map((field: string) => (
                                        <option key={field} value={field}>
                                            {FIELD_LABELS[field as keyof DeliveryRecord] ?? field}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ChevronLeft size={16} className="mr-1" />
                    {t('wizard.back')}
                </Button>
                <Button variant="primary" size="md" onClick={() => onConfirm(mapping)}>
                    {t('wizard.confirmImport')}
                </Button>
            </div>
        </div>
    );
}
