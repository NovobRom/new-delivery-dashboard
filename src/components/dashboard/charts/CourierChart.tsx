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
        <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] text-sm">
                {/* Header Row */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                    <div className="sticky left-0 z-10 w-48 flex-shrink-0 font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 p-2 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {t('charts.courier')}
                    </div>
                    {dates.map((date) => (
                        <div key={date} className="flex-1 min-w-[60px] text-center font-medium text-slate-600 dark:text-slate-400 p-2 transform -rotate-45 origin-bottom-left sm:rotate-0 sm:origin-center translate-y-2 sm:translate-y-0">
                            {date.slice(0, 5)} {/* Show only dd.mm */}
                        </div>
                    ))}
                </div>

                {/* Data Rows */}
                <div className="overflow-y-visible space-y-1">
                    {couriers.map((courier) => (
                        <div key={courier.courier} className="flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors">
                            <div className="sticky left-0 z-10 w-48 flex-shrink-0 truncate p-2 text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" title={courier.courier}>
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
                                        className="flex-1 min-w-[60px] p-1 flex justify-center group relative"
                                        onMouseEnter={(e) => handleMouseEnter(e, courier.courier, date, dayData)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div className={`w-full h-8 rounded flex items-center justify-center text-xs font-bold cursor-help ${getCellColor(dayData.rate)} shadow-sm`}>
                                            {Math.round(dayData.rate)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Portal Tooltip */}
            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] w-48 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 8, // Add a small gap vertically
                    }}
                >
                    <p className="font-bold text-slate-900 dark:text-white mb-1">{tooltip.courier}</p>
                    <p className="text-slate-500 dark:text-slate-400">{tooltip.date}</p>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
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
