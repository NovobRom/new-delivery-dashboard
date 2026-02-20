import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slices/dataSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
    reducer: {
        data: dataReducer,
        filters: filtersReducer,
        ui: uiReducer,
        settings: settingsReducer,
    },
});

// Sync settings changes to localStorage
store.subscribe(() => {
    const state = store.getState();
    try {
        localStorage.setItem(
            'dashboard_settings_excluded_couriers',
            JSON.stringify(state.settings.excludedCouriers)
        );
    } catch (e) {
        console.error('Failed to save excluded couriers to localStorage', e);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
