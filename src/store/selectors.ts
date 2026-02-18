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
                if (!recordDate) return true;
                if (startDate && recordDate < startDate) return false;
                if (endDate && recordDate > endDate) return false;
                return true;
            });
        }

        // Department multi-filter
        if (filters.selectedDepartments.length > 0) {
            filtered = filtered.filter((r) => filters.selectedDepartments.includes(r.department));
        }

        // Courier multi-filter
        if (filters.selectedCouriers.length > 0) {
            filtered = filtered.filter((r) => filters.selectedCouriers.includes(r.courierId));
        }

        return filtered;
    },
);

/** Unique departments for filter dropdown */
export const selectUniqueDepartments = createSelector(
    [selectRecords],
    (records) => [...new Set(records.map((r) => r.department).filter(Boolean))].sort(),
);

/** Unique couriers for filter dropdown */
export const selectUniqueCouriers = createSelector(
    [selectRecords],
    (records) => [...new Set(records.map((r) => r.courierId).filter(Boolean))].sort(),
);

/** Min/max dates from the dataset — used for preset calculations */
export const selectDateBounds = createSelector(
    [selectRecords],
    (records) => {
        const dates = records
            .map((r) => parseDate(r.date))
            .filter((d): d is Date => d !== null);
        if (dates.length === 0) return { min: null, max: null };
        const times = dates.map((d) => d.getTime());
        return {
            min: new Date(Math.min(...times)),
            max: new Date(Math.max(...times)),
        };
    },
);
