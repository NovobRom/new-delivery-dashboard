import { useState, useRef, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { DatasetTarget } from '../../store/slices/dataSlice';
import { Truck, Package, UploadCloud } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadStepProps {
    onFileSelected: (file: File, target: DatasetTarget) => void;
}

export function UploadStep({ onFileSelected }: UploadStepProps) {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [target, setTarget] = useState<DatasetTarget>('deliveries');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChosen = (file: File) => {
        onFileSelected(file, target);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileChosen(file);
        // Reset so same file can be re-selected
        e.target.value = '';
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileChosen(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const types: { value: DatasetTarget; icon: typeof Truck; labelKey: string; descKey: string }[] = [
        { value: 'deliveries', icon: Truck, labelKey: 'wizard.deliveries', descKey: 'wizard.deliveriesDesc' },
        { value: 'pickups', icon: Package, labelKey: 'wizard.pickups', descKey: 'wizard.pickupsDesc' },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Step header */}
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                    {t('wizard.selectType')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {types.map(({ value, icon: Icon, labelKey, descKey }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setTarget(value)}
                            className={clsx(
                                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200',
                                target === value
                                    ? 'border-brand-red bg-brand-red/5 dark:bg-brand-red/10 shadow-sm shadow-brand-red/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            )}
                        >
                            <Icon
                                size={28}
                                className={target === value ? 'text-brand-red' : 'text-slate-400 dark:text-slate-500'}
                            />
                            <div>
                                <p className={clsx(
                                    'font-semibold text-sm',
                                    target === value ? 'text-brand-red' : 'text-slate-700 dark:text-slate-200'
                                )}>
                                    {t(labelKey)}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    {t(descKey)}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={clsx(
                    'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-all duration-200 cursor-pointer',
                    isDragging
                        ? 'border-brand-red bg-brand-red/5 dark:bg-brand-red/10 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-700 hover:border-brand-red/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadCloud
                    size={40}
                    className={isDragging ? 'text-brand-red' : 'text-slate-400 dark:text-slate-500'}
                />
                <div className="text-center">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {t('wizard.selectFile')}
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        {t('wizard.dragDrop')}
                    </p>
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-2">
                        .csv • .txt • .tsv
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.tsv"
                    className="hidden"
                    onChange={handleInputChange}
                />
            </div>
        </div>
    );
}
