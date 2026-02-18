import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay } from 'date-fns';
import { uk } from 'date-fns/locale';

interface DateRange {
    start: string | null;
    end: string | null;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    /** Max date available in the dataset */
    maxDate?: Date | null;
    /** Min date available in the dataset */
    minDate?: Date | null;
}

type Preset = 'all' | 'thisMonth' | 'lastMonth' | 'thisWeek' | 'last7';

const PRESETS: { id: Preset; label: string }[] = [
    { id: 'all', label: 'All Time' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'last7', label: 'Last 7 Days' },
];

function toIso(d: Date): string {
    return format(d, 'yyyy-MM-dd');
}

function detectPreset(range: DateRange, maxDate: Date | null): Preset | null {
    if (!range.start && !range.end) return 'all';
    if (!maxDate) return null;
    const today = startOfDay(new Date());
    const max = startOfDay(maxDate);

    const check = (start: Date, end: Date) =>
        range.start === toIso(start) && range.end === toIso(end);

    if (check(startOfMonth(today), max)) return 'thisMonth';
    if (check(startOfMonth(subMonths(today, 1)), startOfDay(endOfMonth(subMonths(today, 1))))) return 'lastMonth';
    if (check(startOfDay(startOfWeek(today, { weekStartsOn: 1 })), max)) return 'thisWeek';
    if (check(startOfDay(new Date(today.getTime() - 6 * 86400000)), max)) return 'last7';
    return null;
}

export function DateRangePicker({ value, onChange, maxDate, minDate }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => new Date());
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [draft, setDraft] = useState<DateRange>(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync draft when external value changes
    useEffect(() => { setDraft(value); }, [value]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setDraft(value); // cancel
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, value]);

    const applyPreset = useCallback((preset: Preset) => {
        const today = startOfDay(new Date());
        const max = maxDate ? startOfDay(maxDate) : today;

        let range: DateRange;
        switch (preset) {
            case 'all':
                range = { start: null, end: null };
                break;
            case 'thisMonth':
                range = { start: toIso(startOfMonth(today)), end: toIso(max) };
                break;
            case 'lastMonth': {
                const lm = subMonths(today, 1);
                range = { start: toIso(startOfMonth(lm)), end: toIso(endOfMonth(lm)) };
                break;
            }
            case 'thisWeek':
                range = { start: toIso(startOfWeek(today, { weekStartsOn: 1 })), end: toIso(max) };
                break;
            case 'last7':
                range = { start: toIso(new Date(today.getTime() - 6 * 86400000)), end: toIso(max) };
                break;
        }
        setDraft(range);
        onChange(range);
        setOpen(false);
    }, [maxDate, onChange]);

    const handleDayClick = (day: Date) => {
        if (selecting === 'start') {
            setDraft({ start: toIso(day), end: null });
            setSelecting('end');
        } else {
            const start = draft.start ? new Date(draft.start) : day;
            if (day < start) {
                setDraft({ start: toIso(day), end: draft.start });
            } else {
                setDraft({ start: draft.start, end: toIso(day) });
            }
            setSelecting('start');
        }
    };

    const handleApply = () => {
        onChange(draft);
        setOpen(false);
    };

    const handleCancel = () => {
        setDraft(value);
        setOpen(false);
        setSelecting('start');
    };

    // Build calendar days
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const draftStart = draft.start ? startOfDay(new Date(draft.start)) : null;
    const draftEnd = draft.end ? startOfDay(new Date(draft.end)) : null;
    const effectiveEnd = draftEnd || (hoverDate && draftStart && hoverDate > draftStart ? hoverDate : null);

    const isSelected = (day: Date) => {
        if (draftStart && isSameDay(day, draftStart)) return true;
        if (draftEnd && isSameDay(day, draftEnd)) return true;
        return false;
    };

    const isInRange = (day: Date) => {
        if (!draftStart || !effectiveEnd) return false;
        return isWithinInterval(day, { start: draftStart, end: effectiveEnd });
    };

    const isRangeStart = (day: Date) => draftStart ? isSameDay(day, draftStart) : false;
    const isRangeEnd = (day: Date) => effectiveEnd ? isSameDay(day, effectiveEnd) : false;

    // Display label
    const activePreset = detectPreset(value, maxDate ?? null);
    let displayLabel = 'Виберіть дати';
    if (activePreset === 'all') displayLabel = 'All Time';
    else if (activePreset === 'thisMonth') displayLabel = 'This Month';
    else if (activePreset === 'lastMonth') displayLabel = 'Last Month';
    else if (activePreset === 'thisWeek') displayLabel = 'This Week';
    else if (activePreset === 'last7') displayLabel = 'Last 7 Days';
    else if (value.start && value.end) displayLabel = `${value.start.slice(5).split('-').reverse().join('.')} — ${value.end.slice(5).split('-').reverse().join('.')}`;
    else if (value.start) displayLabel = `від ${value.start.slice(5).split('-').reverse().join('.')}`;

    const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => { setOpen((o) => !o); setDraft(value); setSelecting('start'); }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-brand-red hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-red"
            >
                <Calendar size={15} className="text-brand-red shrink-0" />
                <span className="whitespace-nowrap">{displayLabel}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                    style={{ minWidth: 520 }}>

                    {/* Left: Presets */}
                    <div className="flex flex-col gap-1 border-r border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60" style={{ minWidth: 160 }}>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Presets</p>
                        {PRESETS.map((p) => {
                            const isActive = activePreset === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => applyPreset(p.id)}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActive
                                        ? 'bg-brand-red text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {p.label}
                                    {isActive && <span className="ml-2 text-white opacity-80">✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right: Calendar */}
                    <div className="flex flex-col p-4" style={{ minWidth: 320 }}>
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Custom Range</p>

                        {/* Month navigation */}
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                                {format(viewMonth, 'MMMM yyyy', { locale: uk }).replace(/^\w/, c => c.toUpperCase())}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="mb-1 grid grid-cols-7 gap-0.5">
                            {weekDays.map((d) => (
                                <div key={d} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 py-1">{d}</div>
                            ))}
                        </div>

                        {/* Days grid */}
                        <div className="grid grid-cols-7 gap-0.5">
                            {days.map((day) => {
                                const inRange = isInRange(day);
                                const selected = isSelected(day);
                                const rangeStart = isRangeStart(day);
                                const rangeEnd = isRangeEnd(day);
                                const isToday = isSameDay(day, new Date());
                                const inCurrentMonth = isSameMonth(day, viewMonth);

                                let cellClass = 'relative flex h-8 w-full items-center justify-center text-sm cursor-pointer select-none transition-all ';

                                if (selected) {
                                    cellClass += 'text-white font-bold z-10 ';
                                } else if (inRange) {
                                    cellClass += 'text-brand-maroon dark:text-white ';
                                } else if (isToday) {
                                    cellClass += 'font-bold text-brand-red dark:text-brand-red ';
                                } else if (inCurrentMonth) {
                                    cellClass += 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ';
                                } else {
                                    cellClass += 'text-slate-300 dark:text-slate-600 ';
                                }

                                return (
                                    <div
                                        key={day.toISOString()}
                                        className="relative"
                                        onMouseEnter={() => selecting === 'end' && setHoverDate(startOfDay(day))}
                                        onMouseLeave={() => setHoverDate(null)}
                                        onClick={() => handleDayClick(startOfDay(day))}
                                    >
                                        {/* Range background */}
                                        {inRange && !rangeStart && !rangeEnd && (
                                            <div className="absolute inset-y-0 left-0 right-0 bg-brand-periwinkle/40 dark:bg-brand-periwinkle/20" />
                                        )}
                                        {inRange && rangeStart && !rangeEnd && (
                                            <div className="absolute inset-y-0 left-1/2 right-0 bg-brand-periwinkle/40 dark:bg-brand-periwinkle/20" />
                                        )}
                                        {inRange && rangeEnd && !rangeStart && (
                                            <div className="absolute inset-y-0 left-0 right-1/2 bg-brand-periwinkle/40 dark:bg-brand-periwinkle/20" />
                                        )}

                                        {/* Day circle */}
                                        <div className={cellClass}>
                                            {selected && (
                                                <div className="absolute inset-0.5 rounded-full bg-brand-red" />
                                            )}
                                            <span className="relative z-10">{format(day, 'd')}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                            <button
                                onClick={handleCancel}
                                className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={!draft.start}
                                className="rounded-lg bg-brand-red px-4 py-1.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-maroon disabled:opacity-40"
                            >
                                Apply Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
