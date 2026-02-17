import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareMethodData } from '../../../utils/chartHelpers';
import { useAppSelector } from '../../../store/hooks';

interface MethodChartProps {
    data: DeliveryRecord[];
}

const COLORS = ['#DA291C', '#BDD6E6', '#f59e0b', '#64748b', '#10b981']; // Red, Light Blue, Amber (Safe), Slate, Emerald

export function MethodChart({ data }: MethodChartProps) {
    const chartData = useMemo(() => prepareMethodData(data), [data]);
    const { theme } = useAppSelector((state) => state.ui);
    const isDark = theme === 'dark';

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Simple brightness check (very rough) or hardcode specific indices
        // Index 1 is Light Blue (#BDD6E6), needs dark text
        // Index 2 is Amber (#f59e0b), often better with dark text or strong white
        const useDarkText = index === 1;

        return (
            <text
                x={x}
                y={y}
                fill={useDarkText ? "#0f172a" : "#ffffff"}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs font-bold"
                style={{ pointerEvents: 'none' }}
            >
                {value}
            </text>
        );
    };

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomizedLabel}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Safe Place' ? '#14b8a6' : COLORS[index % COLORS.length]} stroke={isDark ? '#1e293b' : '#fff'} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
