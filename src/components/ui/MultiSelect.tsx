import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    /** Label shown in the badge when items are selected */
    selectedLabel?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder, selectedLabel }: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const filtered = search
        ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
        : options;

    const toggle = (val: string) => {
        if (selected.includes(val)) {
            onChange(selected.filter((s) => s !== val));
        } else {
            onChange([...selected, val]);
        }
    };

    const selectAll = () => onChange([...options]);
    const clearAll = () => onChange([]);

    const hasSelection = selected.length > 0;

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                onClick={() => { setOpen((o) => !o); setSearch(''); }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-all ${hasSelection
                    ? 'border-brand-red bg-red-50 text-brand-red dark:bg-brand-red/10 dark:text-red-400 dark:border-red-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-red hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-red'
                    }`}
            >
                <span className="whitespace-nowrap">
                    {hasSelection
                        ? `${selectedLabel || placeholder}: ${selected.length}`
                        : placeholder}
                </span>
                {hasSelection && (
                    <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); clearAll(); }}
                        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-white hover:bg-brand-maroon transition"
                    >
                        <X size={10} />
                    </span>
                )}
                {!hasSelection && <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    {/* Search (only if many options) */}
                    {options.length > 8 && (
                        <div className="border-b border-slate-100 p-2 dark:border-slate-700">
                            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 dark:bg-slate-800">
                                <Search size={13} className="text-slate-400 shrink-0" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Пошук..."
                                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                                />
                            </div>
                        </div>
                    )}

                    {/* Select all / Clear */}
                    {options.length > 1 && (
                        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 dark:border-slate-700">
                            <button
                                onClick={selectAll}
                                className="text-xs font-medium text-brand-red hover:underline"
                            >
                                Всі
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                Скинути
                            </button>
                        </div>
                    )}

                    {/* Options list */}
                    <div className="max-h-56 overflow-y-auto py-1">
                        {filtered.length === 0 && (
                            <p className="px-3 py-2 text-sm text-slate-400">Нічого не знайдено</p>
                        )}
                        {filtered.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                                <button
                                    key={opt}
                                    onClick={() => toggle(opt)}
                                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${isChecked
                                        ? 'bg-red-50 text-brand-red dark:bg-brand-red/10 dark:text-red-400'
                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${isChecked
                                        ? 'border-brand-red bg-brand-red'
                                        : 'border-slate-300 dark:border-slate-600'
                                        }`}>
                                        {isChecked && <Check size={10} className="text-white" />}
                                    </span>
                                    <span className="truncate text-left">{opt}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
