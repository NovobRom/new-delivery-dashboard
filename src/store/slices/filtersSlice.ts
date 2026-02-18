import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
    dateRange: { start: string | null; end: string | null };
    selectedDepartments: string[];
    selectedCouriers: string[];
}

const initialState: FilterState = {
    dateRange: { start: null, end: null },
    selectedDepartments: [],
    selectedCouriers: [],
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
        resetFilters: (state) => {
            state.dateRange = { start: null, end: null };
            state.selectedDepartments = [];
            state.selectedCouriers = [];
        }
    },
});

export const {
    setDateRange,
    setSelectedDepartments,
    toggleDepartment,
    setSelectedCouriers,
    toggleCourier,
    resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
