import { useTranslation } from 'react-i18next';
import { DatasetTarget } from '../../store/slices/dataSlice';
import { Button } from '../ui/Button';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router';

export type ProcessingState = 'loading' | 'success' | 'error';

interface ProcessingStepProps {
    state: ProcessingState;
    target: DatasetTarget;
    recordCount?: number;
    warnings?: string[];
    error?: string;
    onReset: () => void;
}

export function ProcessingStep({
    state,
    target,
    recordCount = 0,
    warnings = [],
    error,
    onReset,
}: ProcessingStepProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const analysisPath = target === 'deliveries' ? '/delivery-analysis' : '/pickup-analysis';

    return (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 min-h-[260px]">
            {/* LOADING */}
            {state === 'loading' && (
                <>
                    <div className="relative flex items-center justify-center w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-brand-red animate-spin" />
                        <Loader2 size={28} className="text-brand-red" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {t('wizard.step3Title')}
                        </p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            {t('wizard.processingFile')}
                        </p>
                    </div>
                </>
            )}

            {/* SUCCESS */}
            {state === 'success' && (
                <>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 animate-in zoom-in duration-300">
                        <CheckCircle2 size={44} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {t('wizard.successTitle')}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('wizard.successCount', { count: recordCount })}
                        </p>
                    </div>

                    {/* Warnings (non-fatal) */}
                    {warnings.length > 0 && (
                        <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 px-3 py-2 text-left">
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                <AlertTriangle size={14} />
                                {t('wizard.warningsTitle')}
                            </p>
                            <ul className="space-y-0.5 text-xs text-amber-600 dark:text-amber-300 max-h-28 overflow-y-auto">
                                {warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-3 flex-wrap justify-center pt-1">
                        <Button variant="ghost" size="sm" onClick={onReset}>
                            <RotateCcw size={14} className="mr-1.5" />
                            {t('wizard.importMore')}
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(analysisPath)}
                        >
                            {t('wizard.goToAnalysis')}
                            <ArrowRight size={16} className="ml-1.5" />
                        </Button>
                    </div>
                </>
            )}

            {/* ERROR */}
            {state === 'error' && (
                <>
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 animate-in zoom-in duration-300">
                        <XCircle size={44} className="text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {t('wizard.errorTitle')}
                        </p>
                        {error && (
                            <p className="text-sm text-red-500 dark:text-red-400 mt-1 max-w-sm">
                                {error}
                            </p>
                        )}
                    </div>
                    <Button variant="outline" size="md" onClick={onReset}>
                        <RotateCcw size={14} className="mr-1.5" />
                        {t('wizard.tryAgain')}
                    </Button>
                </>
            )}
        </div>
    );
}
