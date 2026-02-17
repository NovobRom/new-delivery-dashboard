import { Moon, Sun, Languages } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTheme, setLanguage } from '../../store/slices/uiSlice';
import { Button } from '../ui/Button';

export function Header() {
    const dispatch = useAppDispatch();
    const { theme, currentLang } = useAppSelector((state) => state.ui);

    const toggleTheme = () => {
        dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
    };

    const toggleLang = () => {
        dispatch(setLanguage(currentLang === 'ua' ? 'en' : 'ua'));
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <img
                    src="https://cdn.brandfetch.io/idO8pyOFG4/w/48/h/48/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B"
                    alt="Nova Poshta"
                    className="h-8 w-8"
                />
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delivery <span className="text-brand-red">Dashboard</span>
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleLang} title="Switch Language" className="relative">
                    <Languages size={20} />
                    <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-brand-red text-white px-1 rounded-full border border-white dark:border-slate-900">
                        {currentLang.toUpperCase()}
                    </span>
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
                </Button>
            </div>
        </header>
    );
}
