import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryRecord } from '../../types/schema';

interface DataState {
    records: DeliveryRecord[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: DataState = {
    records: [],
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
        setRecords: (state, action: PayloadAction<DeliveryRecord[]>) => {
            state.records = action.payload;
            state.loading = false;
            state.lastUpdated = new Date().toISOString();
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearData: (state) => {
            state.records = [];
            state.lastUpdated = null;
            state.error = null;
        }
    },
});

export const { setLoading, setRecords, setError, clearData } = dataSlice.actions;

export default dataSlice.reducer;
