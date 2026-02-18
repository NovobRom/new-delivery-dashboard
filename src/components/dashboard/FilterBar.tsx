import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDateRange, setSelectedCity, setSelectedCourier, resetFilters } from '../../store/slices/filtersSlice';
import { selectUniqueCities, selectUniqueCouriers } from '../../store/selectors';
import { Button } from '../ui/Button';
import { Filter, X } from 'lucide-react';

export function FilterBar() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const filters = useAppSelector((state) => state.filters);
    const cities = useAppSelector(selectUniqueCities);
    const couriers = useAppSelector(selectUniqueCouriers);

    const hasActiveFilters = filters.dateRange.start || filters.dateRange.end || filters.selectedCity || filters.selectedCourier;

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm">
            <Filter size={16} className="text-slate-400" />

            <input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => dispatch(setDateRange({ ...filters.dateRange, start: e.target.value || null }))}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                placeholder={t('filters.startDate')}
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => dispatch(setDateRange({ ...filters.dateRange, end: e.target.value || null }))}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />

            <select
                value={filters.selectedCity || ''}
                onChange={(e) => dispatch(setSelectedCity(e.target.value || null))}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
                <option value="">{t('kpi.totalLoaded')} — {t('sidebar.dashboard')}</option>
                {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                ))}
            </select>

            <select
                value={filters.selectedCourier || ''}
                onChange={(e) => dispatch(setSelectedCourier(e.target.value || null))}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
                <option value="">{t('charts.courier')}</option>
                {couriers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilters())} className="text-red-500">
                    <X size={14} className="mr-1" />
                    Reset
                </Button>
            )}
        </div>
    );
}
