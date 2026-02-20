import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { DeliveryRecord } from '../../../types/schema';
import { prepareCourierData } from '../../../utils/chartHelpers';

interface CourierChartProps {
    data: DeliveryRecord[];
}

interface TooltipData {
    x: number;
    y: number;
    courier: string;
    date: string;
    loaded: number;
    delivered: number;
    rate: number;
}

export function CourierChart({ data }: CourierChartProps) {
    const { couriers, dates } = useMemo(() => prepareCourierData(data), [data]);
    const { t } = useTranslation();
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const getCellColor = (rate: number) => {
        if (rate >= 95) return 'bg-emerald-500 text-white';
        if (rate >= 90) return 'bg-amber-400 text-white'; // Yellow/Orange
        return 'bg-red-500 text-white';
    };

    const getBadgeColor = (rate: number) => {
        if (rate >= 95) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
        if (rate >= 90) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
    };

    const handleMouseEnter = (
        e: React.MouseEvent<HTMLDivElement>,
        courierName: string,
        dateStr: string,
        dayData: { loaded: number; delivered: number; rate: number }
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top,
            courier: courierName,
            date: dateStr,
            ...dayData
        });
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    return (
        <div className="w-full overflow-x-auto min-h-[150px] pb-2">
            <div className="min-w-[750px] text-sm"> {/* Increased min-width to accommodate summary column */}
                {/* Header Row */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                    <div className="sticky left-0 z-20 w-48 flex-shrink-0 font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 p-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {t('charts.courier')}
                    </div>
                    {dates.map((date) => (
                        <div key={date} className="flex-1 min-w-[60px] text-center font-medium text-slate-600 dark:text-slate-400 p-2 transform -rotate-45 origin-bottom-left sm:rotate-0 sm:origin-center translate-y-2 sm:translate-y-0">
                            {date.slice(0, 5)} {/* Show only dd.mm */}
                        </div>
                    ))}
                    {/* Summary Column Header */}
                    <div className="sticky right-0 z-20 w-32 flex-shrink-0 font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 p-2 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] text-center">
                        {t('charts.summary')}
                    </div>
                </div>

                {/* Data Rows */}
                <div className="overflow-y-visible space-y-1">
                    {couriers.map((courier) => {
                        // Calculate summary stats
                        let totalLoaded = 0;
                        let totalDelivered = 0;
                        let workDays = 0;

                        dates.forEach(date => {
                            const dayData = courier.dates[date];
                            if (dayData && dayData.loaded > 0) {
                                totalLoaded += dayData.loaded;
                                totalDelivered += dayData.delivered;
                                workDays++;
                            }
                        });

                        const averagePerformance = workDays > 0 ? totalDelivered / workDays : 0;
                        const totalRate = totalLoaded > 0 ? (totalDelivered / totalLoaded) * 100 : 0;

                        return (
                            <div key={courier.courier} className="flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors group">
                                <div className="sticky left-0 z-10 w-48 flex-shrink-0 truncate p-2 text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors" title={courier.courier}>
                                    {courier.courier}
                                </div>
                                {dates.map((date) => {
                                    const dayData = courier.dates[date];
                                    if (!dayData || dayData.loaded === 0) {
                                        return (
                                            <div key={date} className="flex-1 min-w-[60px] p-1 flex justify-center">
                                                <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-300 text-xs">
                                                    -
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={date}
                                            className="flex-1 min-w-[60px] p-1 flex justify-center group/cell relative"
                                            onMouseEnter={(e) => handleMouseEnter(e, courier.courier, date, dayData)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <div className={`w-full h-8 rounded flex items-center justify-center text-xs font-bold cursor-help ${getCellColor(dayData.rate)} shadow-sm`}>
                                                {Math.round(dayData.rate)}
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Summary Column Data */}
                                <div className="sticky right-0 z-10 w-32 flex-shrink-0 flex items-center justify-center p-2 bg-white dark:bg-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors border-l border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center justify-around w-full gap-2">
                                        <div className="flex flex-col items-center justify-center" title={t('charts.avgPerformance')}>
                                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">AVG</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{Math.round(averagePerformance)}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center" title={t('charts.totalRate')}>
                                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">%</span>
                                            <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${getBadgeColor(totalRate)}`}>
                                                {Math.round(totalRate)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Portal Tooltip */}
            {tooltip && createPortal(
                <div
                    className="fixed z-[100000] w-48 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8, // Add a small gap vertically
                    }}
                >
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{tooltip.courier}</p>
                    <p className="text-slate-500 dark:text-slate-400">{tooltip.date}</p>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-600 dark:text-slate-300">{t('charts.performance')}:</span>
                        <span className="font-medium text-blue-500">{tooltip.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">{t('charts.loaded')}:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{tooltip.loaded}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">{t('charts.delivered')}:</span>
                        <span className="font-medium text-emerald-500">{tooltip.delivered}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">{t('charts.rate')}:</span>
                        <span className={`font-bold ${tooltip.rate >= 95 ? 'text-emerald-500' : tooltip.rate >= 90 ? 'text-amber-500' : 'text-red-500'}`}>
                            {tooltip.rate}%
                        </span>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
