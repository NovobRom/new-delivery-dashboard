import { useRef, ChangeEvent, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setRecords, setLoading, setError } from '../../store/slices/dataSlice';
import { parseCSV } from '../../utils/csvParser';
import { Button } from '../ui/Button';
import { UploadCloud, Loader2 } from 'lucide-react';

export function DataImport() {
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        dispatch(setLoading(true));

        try {
            // Small delay to allow UI to update to loading state
            await new Promise(resolve => setTimeout(resolve, 100));

            const records = await parseCSV(file);
            dispatch(setRecords(records));
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
        <>
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
                        Processing...
                    </>
                ) : (
                    <>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        Import Data
                    </>
                )}
            </Button>
        </>
    );
}
