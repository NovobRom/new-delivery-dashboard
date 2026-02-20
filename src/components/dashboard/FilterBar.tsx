import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    setDateRange,
    setSelectedDepartments,
    setSelectedCouriers,
    setSelectedCountries,
    setSelectedCities,
    resetFilters,
} from '../../store/slices/filtersSlice';
import { createDatasetSelectors } from '../../store/selectors';
import { DatasetTarget } from '../../store/slices/dataSlice';
import { DateRangePicker } from '../ui/DateRangePicker';
import { MultiSelect } from '../ui/MultiSelect';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
    target?: DatasetTarget;
}

export function FilterBar({ target = 'deliveries' }: FilterBarProps) {
    const dispatch = useAppDispatch();
    const filters = useAppSelector((state) => state.filters);
    const {
        selectUniqueDepartments,
        selectUniqueCouriers,
        selectUniqueCountries,
        selectUniqueCities,
        selectDateBounds
    } = createDatasetSelectors(target);
    const departments = useAppSelector(selectUniqueDepartments);
    const couriers = useAppSelector(selectUniqueCouriers);
    const countries = useAppSelector(selectUniqueCountries);
    const cities = useAppSelector(selectUniqueCities);
    const dateBounds = useAppSelector(selectDateBounds);

    const hasActiveFilters =
        filters.dateRange.start ||
        filters.dateRange.end ||
        filters.selectedDepartments.length > 0 ||
        filters.selectedCouriers.length > 0 ||
        filters.selectedCountries.length > 0 ||
        filters.selectedCities.length > 0;

    return (
        <div className="relative z-[60] flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm">
            <Filter size={16} className="text-slate-400 shrink-0" />

            {/* Date Range Picker */}
            <DateRangePicker
                value={filters.dateRange}
                onChange={(range) => dispatch(setDateRange(range))}
                maxDate={dateBounds.max}
                minDate={dateBounds.min}
            />

            {/* Country multi-select */}
            <MultiSelect
                options={countries}
                selected={filters.selectedCountries}
                onChange={(vals) => dispatch(setSelectedCountries(vals))}
                placeholder="Країна"
                selectedLabel="Країн"
            />

            {/* City multi-select */}
            <MultiSelect
                options={cities}
                selected={filters.selectedCities}
                onChange={(vals) => dispatch(setSelectedCities(vals))}
                placeholder="Місто"
                selectedLabel="Міст"
            />

            {/* Department multi-select */}
            <MultiSelect
                options={departments}
                selected={filters.selectedDepartments}
                onChange={(vals) => dispatch(setSelectedDepartments(vals))}
                placeholder="Підрозділ — Дашборд"
                selectedLabel="Підрозділ"
            />

            {/* Courier multi-select */}
            <MultiSelect
                options={couriers}
                selected={filters.selectedCouriers}
                onChange={(vals) => dispatch(setSelectedCouriers(vals))}
                placeholder="Кур'єр"
                selectedLabel="Кур'єрів"
            />

            {/* Reset */}
            {hasActiveFilters && (
                <button
                    onClick={() => dispatch(resetFilters())}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <X size={14} />
                    Reset
                </button>
            )}
        </div>
    );
}
