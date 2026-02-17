import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slices/dataSlice';
import filtersReducer from './slices/filtersSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        data: dataReducer,
        filters: filtersReducer,
        ui: uiReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
