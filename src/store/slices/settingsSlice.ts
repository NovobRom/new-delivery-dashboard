import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
    excludedCouriers: string[];
}

// Load initial state from localStorage if available
const loadInitialState = (): SettingsState => {
    try {
        const saved = localStorage.getItem('dashboard_settings_excluded_couriers');
        if (saved) {
            return { excludedCouriers: JSON.parse(saved) };
        }
    } catch (e) {
        console.error('Failed to parse excluded couriers from localStorage', e);
    }
    return { excludedCouriers: [] };
};

const initialState: SettingsState = loadInitialState();

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        addExcludedCourier: (state: SettingsState, action: PayloadAction<string>) => {
            const name = action.payload.trim();
            if (name && !state.excludedCouriers.some((c: string) => c.toLowerCase() === name.toLowerCase())) {
                state.excludedCouriers.push(name);
            }
        },
        removeExcludedCourier: (state: SettingsState, action: PayloadAction<string>) => {
            const nameToRemove = action.payload.toLowerCase();
            state.excludedCouriers = state.excludedCouriers.filter(
                (c: string) => c.toLowerCase() !== nameToRemove
            );
        },
    },
});

export const { addExcludedCourier, removeExcludedCourier } = settingsSlice.actions;
export default settingsSlice.reducer;
