import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareTrendData } from '../../../utils/chartHelpers';
import { useAppSelector } from '../../../store/hooks';

interface TrendChartProps {
    data: DeliveryRecord[];
}

export function TrendChart({ data }: TrendChartProps) {
    const chartData = useMemo(() => prepareTrendData(data), [data]);
    const { theme } = useAppSelector((state) => state.ui);
    const isDark = theme === 'dark';

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
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e2e8f0"} vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderColor: isDark ? '#334155' : '#e2e8f0',
                            borderRadius: '8px',
                            color: isDark ? '#f8fafc' : '#0f172a'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#BDD6E6"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        name="Total Parcels"
                    />
                    <Area
                        type="monotone"
                        dataKey="delivered"
                        stroke="#DA291C"
                        fillOpacity={1}
                        fill="url(#colorDelivered)"
                        name="Delivered"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
