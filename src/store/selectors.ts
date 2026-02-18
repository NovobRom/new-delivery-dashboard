import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { parseDate } from '../utils/dateUtils';

const selectRecords = (state: RootState) => state.data.records;
const selectFilters = (state: RootState) => state.filters;

export const selectFilteredRecords = createSelector(
    [selectRecords, selectFilters],
    (records, filters) => {
        let filtered = records;

        // Date range filter
        if (filters.dateRange.start || filters.dateRange.end) {
            const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
            const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

            filtered = filtered.filter((r) => {
                const recordDate = parseDate(r.date);
                if (!recordDate) return true; // Keep records with unparseable dates
                if (startDate && recordDate < startDate) return false;
                if (endDate && recordDate > endDate) return false;
                return true;
            });
        }

        // City filter
        if (filters.selectedCity) {
            filtered = filtered.filter((r) => r.city === filters.selectedCity);
        }

        // Courier filter
        if (filters.selectedCourier) {
            filtered = filtered.filter((r) => r.courierId === filters.selectedCourier);
        }

        return filtered;
    },
);

/** Extract unique values for filter dropdowns */
export const selectUniqueCities = createSelector(
    [selectRecords],
    (records) => [...new Set(records.map((r) => r.city).filter(Boolean))].sort(),
);

export const selectUniqueCouriers = createSelector(
    [selectRecords],
    (records) => [...new Set(records.map((r) => r.courierId).filter(Boolean))].sort(),
);
