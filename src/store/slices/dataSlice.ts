import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryRecord } from '../../types/schema';

export type DatasetTarget = 'deliveries' | 'pickups';

interface DataState {
    deliveries: DeliveryRecord[];
    pickups: DeliveryRecord[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: DataState = {
    deliveries: [],
    pickups: [],
    loading: false,
    error: null,
    lastUpdated: null,
};

export const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        /**
         * Replaces the records for the given target dataset.
         * Loading pickups does NOT clear deliveries (and vice versa).
         * Re-uploading the same type overwrites previous data of that type.
         */
        setRecords: (
            state,
            action: PayloadAction<{ target: DatasetTarget; records: DeliveryRecord[] }>
        ) => {
            state[action.payload.target] = action.payload.records;
            state.loading = false;
            state.lastUpdated = new Date().toISOString();
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        /**
         * Clears data for a specific target, or both datasets if no target given.
         */
        clearData: (state, action: PayloadAction<DatasetTarget | undefined>) => {
            const target = action.payload;
            if (!target || target === 'deliveries') state.deliveries = [];
            if (!target || target === 'pickups') state.pickups = [];
            state.lastUpdated = null;
            state.error = null;
        },
    },
});

export const { setLoading, setRecords, setError, clearData } = dataSlice.actions;

export default dataSlice.reducer;
