import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    dateRange: { start: string | null; end: string | null };
    selectedDepartments: string[];
    selectedCouriers: string[];
    selectedCountries: string[];
    selectedCities: string[];
}

const initialState: FilterState = {
    dateRange: { start: null, end: null },
    selectedDepartments: [],
    selectedCouriers: [],
    selectedCountries: [],
    selectedCities: [],
};

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
            state.dateRange = action.payload;
        },
        setSelectedDepartments: (state, action: PayloadAction<string[]>) => {
            state.selectedDepartments = action.payload;
        },
        toggleDepartment: (state, action: PayloadAction<string>) => {
            const idx = state.selectedDepartments.indexOf(action.payload);
            if (idx === -1) {
                state.selectedDepartments.push(action.payload);
            } else {
                state.selectedDepartments.splice(idx, 1);
            }
        },
        setSelectedCouriers: (state, action: PayloadAction<string[]>) => {
            state.selectedCouriers = action.payload;
        },
        toggleCourier: (state, action: PayloadAction<string>) => {
            const idx = state.selectedCouriers.indexOf(action.payload);
            if (idx === -1) {
                state.selectedCouriers.push(action.payload);
            } else {
                state.selectedCouriers.splice(idx, 1);
            }
        },
        setSelectedCountries: (state, action: PayloadAction<string[]>) => {
            state.selectedCountries = action.payload;
        },
        setSelectedCities: (state, action: PayloadAction<string[]>) => {
            state.selectedCities = action.payload;
        },
        resetFilters: (state) => {
            state.dateRange = { start: null, end: null };
            state.selectedDepartments = [];
            state.selectedCouriers = [];
            state.selectedCountries = [];
            state.selectedCities = [];
        }
    },
});

export const {
    setDateRange,
    setSelectedDepartments,
    toggleDepartment,
    setSelectedCouriers,
    toggleCourier,
    setSelectedCountries,
    setSelectedCities,
    resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
