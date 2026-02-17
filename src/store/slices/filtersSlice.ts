import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    dateRange: { start: string | null; end: string | null };
    selectedCity: string | null;
    selectedCourier: string | null;
}

const initialState: FilterState = {
    dateRange: { start: null, end: null },
    selectedCity: null,
    selectedCourier: null,
};

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
            state.dateRange = action.payload;
        },
        setSelectedCity: (state, action: PayloadAction<string | null>) => {
            state.selectedCity = action.payload;
        },
        setSelectedCourier: (state, action: PayloadAction<string | null>) => {
            state.selectedCourier = action.payload;
        },
        resetFilters: (state) => {
            state.dateRange = { start: null, end: null };
            state.selectedCity = null;
            state.selectedCourier = null;
        }
    },
});

export const { setDateRange, setSelectedCity, setSelectedCourier, resetFilters } = filtersSlice.actions;

export default filtersSlice.reducer;
