import { useAppSelector } from '../store/hooks';

export function useThemeMode() {
    const { theme } = useAppSelector((state) => state.ui);
    return { theme, isDark: theme === 'dark' };
}
