import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareRegionalData } from '../../../utils/chartHelpers';
import { useAppSelector } from '../../../store/hooks';

interface RegionalChartProps {
    data: DeliveryRecord[];
}

export function RegionalChart({ data }: RegionalChartProps) {
    const chartData = useMemo(() => prepareRegionalData(data), [data]);
    const { theme } = useAppSelector((state) => state.ui);
    const isDark = theme === 'dark';

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e2e8f0"} horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderColor: isDark ? '#334155' : '#e2e8f0',
                            borderRadius: '8px',
                            color: isDark ? '#f8fafc' : '#0f172a'
                        }}
                    />
                    <Bar dataKey="successRate" name="Success Rate" radius={[0, 4, 4, 0]} barSize={20}>
                        <LabelList dataKey="successRate" position="right" fill={isDark ? "#e2e8f0" : "#475569"} fontSize={10} formatter={(val: any) => `${val}%`} />
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.successRate > 95 ? '#10b981' : entry.successRate > 90 ? '#f59e0b' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
