import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Info } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    color?: 'red' | 'blue' | 'green' | 'amber' | 'emerald' | 'indigo' | 'cyan' | 'teal' | 'orange';
    delay?: number;
    tooltip?: React.ReactNode;
}

export function KpiCard({ title, value, icon: Icon, trend, color = 'blue', delay = 0, tooltip }: KpiCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const colorMap = {
        red: 'bg-red-50 text-brand-red dark:bg-red-900/20 dark:text-red-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400',
        teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay * 0.1 }}
            className={`relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:backdrop-blur-xl ${showTooltip ? 'z-50' : ''}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                        {tooltip && <Info size={14} className="text-slate-400" />}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
                        {trend && (
                            <span className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-brand-red'}`}>
                                {trend.isPositive ? '+' : ''}{trend.value}% {trend.label}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`rounded-xl p-3 ${colorMap[color]}`}>
                    <Icon size={24} />
                </div>
            </div>

            {/* Tooltip Overlay */}
            <AnimatePresence>
                {showTooltip && tooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800"
                        style={{ marginTop: '-10px', marginLeft: '10px' }} // Adjustment to make it look like a popover
                    >
                        {tooltip}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative gradient blob */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand-red/5 to-transparent blur-2xl pointer-events-none" />
        </motion.div>
    );
}
