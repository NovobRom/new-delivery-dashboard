import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareDensityData } from '../../../utils/chartHelpers';
import { useThemeMode } from '../../../hooks/useThemeMode';
import { getChartTheme } from '../../../constants/chartTheme';

interface DensityChartProps {
    data: DeliveryRecord[];
}

export function DensityChart({ data }: DensityChartProps) {
    const chartData = useMemo(() => prepareDensityData(data), [data]);
    const { t } = useTranslation();
    const { isDark } = useThemeMode();
    const ct = getChartTheme(isDark);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} vertical={false} />
                    <XAxis dataKey="date" stroke={ct.axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={ct.axisStroke} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: ct.cursorFill, opacity: 0.4 }} contentStyle={ct.tooltipStyle} />
                    <Legend />
                    <Bar dataKey="loaded" name={t('charts.loadedParcels')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="addresses" name={t('charts.uniqueAddresses')} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
