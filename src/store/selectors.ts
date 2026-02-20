import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { parseDate } from '../utils/dateUtils';
import { DatasetTarget } from './slices/dataSlice';

const selectFilters = (state: RootState) => state.filters;

/**
 * Factory that creates a full set of memoized selectors for a given dataset target.
 * Use `deliverySelectors` or `pickupSelectors` in components — never import raw selectors.
 */
export function createDatasetSelectors(target: DatasetTarget) {
    const selectRecords = (state: RootState) => state.data[target];

    const selectFilteredRecords = createSelector(
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

            // Country multi-filter
            if (filters.selectedCountries.length > 0) {
                filtered = filtered.filter((r) => filters.selectedCountries.includes(r.country));
            }

            // City multi-filter
            if (filters.selectedCities.length > 0) {
                filtered = filtered.filter((r) => filters.selectedCities.includes(r.city));
            }

            return filtered;
        },
    );

    /** Unique departments for filter dropdown */
    const selectUniqueDepartments = createSelector(
        [selectRecords, selectFilters],
        (records, filters) => {
            let relevantRecords = records;
            if (filters.selectedCountries.length > 0) {
                relevantRecords = relevantRecords.filter(r => filters.selectedCountries.includes(r.country));
            }
            if (filters.selectedCities.length > 0) {
                relevantRecords = relevantRecords.filter(r => filters.selectedCities.includes(r.city));
            }
            return [...new Set(relevantRecords.map((r) => r.department).filter(Boolean))].sort();
        }
    );

    /** Unique couriers for filter dropdown */
    const selectUniqueCouriers = createSelector(
        [selectRecords, selectFilters],
        (records, filters) => {
            let relevantRecords = records;
            if (filters.selectedCountries.length > 0) {
                relevantRecords = relevantRecords.filter(r => filters.selectedCountries.includes(r.country));
            }
            if (filters.selectedCities.length > 0) {
                relevantRecords = relevantRecords.filter(r => filters.selectedCities.includes(r.city));
            }
            if (filters.selectedDepartments.length > 0) {
                relevantRecords = relevantRecords.filter(r => filters.selectedDepartments.includes(r.department));
            }
            return [...new Set(relevantRecords.map((r) => r.courierId).filter(Boolean))].sort();
        }
    );

    /** Unique countries for filter dropdown */
    const selectUniqueCountries = createSelector(
        [selectRecords],
        (records) => [...new Set(records.map((r) => r.country).filter(Boolean))].sort(),
    );

    /** Unique cities for filter dropdown (cascading based on country selection) */
    const selectUniqueCities = createSelector(
        [selectRecords, selectFilters],
        (records, filters) => {
            // Support cascading: if countries are selected, only show cities in those countries
            const relevantRecords = filters.selectedCountries.length > 0
                ? records.filter(r => filters.selectedCountries.includes(r.country))
                : records;

            return [...new Set(relevantRecords.map((r) => r.city).filter(Boolean))].sort();
        }
    );

    /** Min/max dates from the dataset — used for preset calculations */
    const selectDateBounds = createSelector(
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

    return {
        selectRecords,
        selectFilteredRecords,
        selectUniqueDepartments,
        selectUniqueCouriers,
        selectUniqueCountries,
        selectUniqueCities,
        selectDateBounds,
    };
}

// Pre-built selector sets for each page
export const deliverySelectors = createDatasetSelectors('deliveries');
export const pickupSelectors = createDatasetSelectors('pickups');

/** True if at least one dataset has been loaded — used for routing guards */
export const selectHasAnyData = (state: RootState) =>
    state.data.deliveries.length > 0 || state.data.pickups.length > 0;
