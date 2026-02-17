import { LayoutDashboard, FileSpreadsheet, Settings, Truck, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: FileSpreadsheet, label: 'Data Import', id: 'import' },
    { icon: BarChart3, label: 'Analysis', id: 'analysis' },
    { icon: Truck, label: 'Couriers', id: 'couriers' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

export function Sidebar() {
    const dispatch = useAppDispatch();
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
                        LOGISTICS
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
                    <Button
                        key={item.id}
                        variant="ghost"
                        className={`w-full justify-start ${!isSidebarOpen && 'justify-center px-0'}`}
                    >
                        <item.icon size={20} className={isSidebarOpen ? 'mr-2' : ''} />
                        {isSidebarOpen && <span>{item.label}</span>}
                    </Button>
                ))}
            </nav>


        </motion.aside>
    );
}
