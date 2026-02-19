import { LayoutDashboard, FileSpreadsheet, Settings, Truck, BarChart3, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', id: 'dashboard', to: '/dashboard' },
    { icon: FileSpreadsheet, labelKey: 'sidebar.import', id: 'import', to: '/import' },
    { icon: BarChart3, labelKey: 'sidebar.analysis', id: 'analysis', to: '/delivery-analysis' },
    { icon: Package, labelKey: 'sidebar.pickupAnalysis', id: 'pickup-analysis', to: '/pickup-analysis' },
    { icon: Truck, labelKey: 'sidebar.couriers', id: 'couriers', to: '/couriers' },
    { icon: Settings, labelKey: 'sidebar.settings', id: 'settings', to: '/settings' },
];

export function Sidebar() {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const { isSidebarOpen } = useAppSelector((state) => state.ui);

    return (
        <motion.aside
            initial={{ width: isSidebarOpen ? 240 : 80 }}
            animate={{ width: isSidebarOpen ? 240 : 80 }}
            className="relative z-30 flex h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-brand-card transition-all duration-300"
        >
            <div className="flex h-16 items-center justify-between px-4">
                {isSidebarOpen && (
                    <span className="text-xl font-bold bg-gradient-to-r from-brand-red to-red-400 bg-clip-text text-transparent">
                        {t('sidebar.logo')}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(toggleSidebar())}
                    className="ml-auto"
                >
                    {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </Button>
            </div>

            <nav className="flex-1 space-y-2 p-2">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors
                            ${isActive
                                ? 'bg-brand-red/10 text-brand-red dark:bg-brand-red/20'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            }
                            ${!isSidebarOpen ? 'justify-center px-0' : ''}`
                        }
                    >
                        <item.icon size={20} className={isSidebarOpen ? 'mr-2' : ''} />
                        {isSidebarOpen && <span>{t(item.labelKey)}</span>}
                    </NavLink>
                ))}
            </nav>
        </motion.aside>
    );
}
