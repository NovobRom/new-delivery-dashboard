import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareDensityData } from '../../../utils/chartHelpers';
import { useAppSelector } from '../../../store/hooks';

interface DensityChartProps {
    data: DeliveryRecord[];
}

export function DensityChart({ data }: DensityChartProps) {
    const chartData = useMemo(() => prepareDensityData(data), [data]);
    const { theme } = useAppSelector((state) => state.ui);
    const isDark = theme === 'dark';

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                        cursor={{ fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4 }}
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            borderColor: isDark ? '#334155' : '#e2e8f0',
                            borderRadius: '8px',
                            color: isDark ? '#f8fafc' : '#0f172a'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="loaded" name="Loaded Parcels" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="addresses" name="Unique Addresses" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
