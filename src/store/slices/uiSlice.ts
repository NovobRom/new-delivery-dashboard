import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    isSidebarOpen: boolean;
    theme: 'light' | 'dark';
    currentLang: 'ua' | 'en';
}

const initialState: UiState = {
    isSidebarOpen: true,
    theme: 'dark', // Default to Dark Mode for Nova Post branding
    currentLang: 'ua',
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        setLanguage: (state, action: PayloadAction<'ua' | 'en'>) => {
            state.currentLang = action.payload;
        }
    },
});

export const { toggleSidebar, setTheme, setLanguage } = uiSlice.actions;

export default uiSlice.reducer;
