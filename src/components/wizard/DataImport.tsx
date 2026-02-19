import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../store/hooks';
import { setRecords, setLoading, DatasetTarget } from '../../store/slices/dataSlice';
import { previewCSV, parseCSV, CSVPreview, UserMapping } from '../../utils/csvParser';
import { UploadStep } from './UploadStep';
import { MappingStep } from './MappingStep';
import { ProcessingStep, ProcessingState } from './ProcessingStep';

// ---------------------------------------------------------------------------
// State Machine
// UPLOAD → MAPPING → PROCESSING (loading | success | error)
// Any state → UPLOAD via reset
// ---------------------------------------------------------------------------
type WizardStep = 'UPLOAD' | 'MAPPING' | 'PROCESSING';

interface WizardState {
    step: WizardStep;
    target: DatasetTarget;
    file: File | null;
    preview: CSVPreview | null;
    processingState: ProcessingState;
    recordCount: number;
    warnings: string[];
    error: string | null;
}

const INITIAL_STATE: WizardState = {
    step: 'UPLOAD',
    target: 'deliveries',
    file: null,
    preview: null,
    processingState: 'loading',
    recordCount: 0,
    warnings: [],
    error: null,
};

export function DataImport() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const [state, setState] = useState<WizardState>(INITIAL_STATE);

    // -- Helpers --
    const update = (patch: Partial<WizardState>) =>
        setState((prev) => ({ ...prev, ...patch }));

    const reset = () => setState(INITIAL_STATE);

    // ---------------------------------------------------------------------------
    // Step 1 → Step 2: file chosen, run preview
    // ---------------------------------------------------------------------------
    const handleFileSelected = async (file: File, target: DatasetTarget) => {
        update({ step: 'PROCESSING', processingState: 'loading', target, file, error: null });

        try {
            const preview = await previewCSV(file);
            update({ step: 'MAPPING', preview });
        } catch (err) {
            console.error(err);
            update({
                step: 'PROCESSING',
                processingState: 'error',
                error: err instanceof Error ? err.message : t('wizard.errorTitle'),
            });
        }
    };

    // ---------------------------------------------------------------------------
    // Step 2 → Step 3: user confirmed mapping, run full parse
    // ---------------------------------------------------------------------------
    const handleMappingConfirmed = async (userMapping: UserMapping) => {
        if (!state.file || !state.preview) return;

        update({ step: 'PROCESSING', processingState: 'loading', error: null });
        dispatch(setLoading(true));

        try {
            // Small paint-frame delay so the loader renders before heavy work
            await new Promise((r) => setTimeout(r, 80));

            const result = await parseCSV(state.file, userMapping, {
                encoding: state.preview.detectedEncoding,
                delimiter: state.preview.detectedDelimiter,
            });

            dispatch(setRecords({ target: state.target, records: result.records }));

            update({
                processingState: 'success',
                recordCount: result.records.length,
                warnings: result.warnings,
            });
        } catch (err) {
            console.error(err);
            update({
                processingState: 'error',
                error: err instanceof Error ? err.message : t('wizard.errorTitle'),
            });
        }
    };

    // ---------------------------------------------------------------------------
    // Step indicators
    // ---------------------------------------------------------------------------
    const STEPS = [
        t('wizard.step1Title'),
        t('wizard.step2Title'),
        t('wizard.step3Title'),
    ];

    const currentStepIndex =
        state.step === 'UPLOAD' ? 0 :
            state.step === 'MAPPING' ? 1 : 2;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-6">
                {STEPS.map((label, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className={`
                                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                    ${idx < currentStepIndex
                                        ? 'bg-emerald-500 text-white'
                                        : idx === currentStepIndex
                                            ? 'bg-brand-red text-white shadow-sm shadow-brand-red/30'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}
                                `}
                            >
                                {idx < currentStepIndex ? '✓' : idx + 1}
                            </div>
                            <span
                                className={`text-xs font-medium truncate transition-colors hidden sm:block ${idx === currentStepIndex
                                        ? 'text-slate-800 dark:text-slate-100'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-px transition-colors ${idx < currentStepIndex
                                        ? 'bg-emerald-400 dark:bg-emerald-600'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {state.step === 'UPLOAD' && (
                    <UploadStep onFileSelected={handleFileSelected} />
                )}

                {state.step === 'MAPPING' && state.preview && (
                    <MappingStep
                        preview={state.preview}
                        onBack={reset}
                        onConfirm={handleMappingConfirmed}
                    />
                )}

                {state.step === 'PROCESSING' && (
                    <ProcessingStep
                        state={state.processingState}
                        target={state.target}
                        recordCount={state.recordCount}
                        warnings={state.warnings}
                        error={state.error ?? undefined}
                        onReset={reset}
                    />
                )}
            </div>
        </div>
    );
}
