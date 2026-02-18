import { useRef, ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store/hooks';
import { setRecords, setLoading, setError } from '../../store/slices/dataSlice';
import { parseCSV } from '../../utils/csvParser';
import { Button } from '../ui/Button';
import { UploadCloud, Loader2, AlertTriangle } from 'lucide-react';

export function DataImport() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [warnings, setWarnings] = useState<string[]>([]);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setWarnings([]);
        dispatch(setLoading(true));

        try {
            // Small delay to allow UI to update to loading state
            await new Promise(resolve => setTimeout(resolve, 100));

            const result = await parseCSV(file);
            dispatch(setRecords(result.records));

            if (result.warnings.length > 0) {
                setWarnings(result.warnings);
            }
        } catch (err) {
            console.error(err);
            dispatch(setError('Failed to parse CSV file. Please check the format.'));
        } finally {
            setIsProcessing(false);
            // Reset input value to allow selecting same file again
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.txt,.tsv"
            />
            <Button
                size="lg"
                variant="primary"
                onClick={handleClick}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('import.processing')}
                    </>
                ) : (
                    <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {t('import.importData')}
                    </>
                )}
            </Button>

            {warnings.length > 0 && (
                <div className="mt-2 max-w-md rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/30">
                    <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-400 mb-1">
                        <AlertTriangle size={16} />
                        {t('import.warnings')}
                    </div>
                    <ul className="space-y-0.5 text-amber-600 dark:text-amber-300">
                        {warnings.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
