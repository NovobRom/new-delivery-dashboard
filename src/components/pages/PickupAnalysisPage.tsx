import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';

export function PickupAnalysisPage() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                <Package size={48} className="text-brand-red" />
            </div>
            <h2 className="text-2xl font-bold">{t('sidebar.pickupAnalysis')}</h2>
            <p className="text-slate-500 max-w-md">
                Coming soon...
            </p>
        </div>
    );
}
