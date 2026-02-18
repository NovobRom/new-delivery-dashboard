import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareTrendData } from '../../../utils/chartHelpers';
import { useThemeMode } from '../../../hooks/useThemeMode';
import { getChartTheme } from '../../../constants/chartTheme';

interface TrendChartProps {
    data: DeliveryRecord[];
}

export function TrendChart({ data }: TrendChartProps) {
    const chartData = useMemo(() => prepareTrendData(data), [data]);
    const { t } = useTranslation();
    const { isDark } = useThemeMode();
    const ct = getChartTheme(isDark);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#BDD6E6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#BDD6E6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#DA291C" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#DA291C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                    <XAxis dataKey="date" stroke={ct.axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={ct.axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={ct.tooltipStyle} />
                    <Area type="monotone" dataKey="total" stroke="#BDD6E6" fillOpacity={1} fill="url(#colorTotal)" name={t('charts.totalParcels')} />
                    <Area type="monotone" dataKey="delivered" stroke="#DA291C" fillOpacity={1} fill="url(#colorDelivered)" name={t('charts.delivered')} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
