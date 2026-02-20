import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { DeliveryRecord } from '../../../types/schema';
import { prepareRegionalData } from '../../../utils/chartHelpers';
import { useThemeMode } from '../../../hooks/useThemeMode';
import { getChartTheme } from '../../../constants/chartTheme';

interface RegionalChartProps {
    data: DeliveryRecord[];
}

export function RegionalChart({ data }: RegionalChartProps) {
    const chartData = prepareRegionalData(data);
    const { isDark } = useThemeMode();
    const ct = getChartTheme(isDark);

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.gridStroke} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke={ct.axisStroke} fontSize={12} tickLine={false} axisLine={false} unit="%" />
                    <YAxis dataKey="name" type="category" stroke={ct.axisStroke} fontSize={11} tickLine={false} axisLine={false} width={100} />
                    <Tooltip cursor={{ fill: ct.cursorFill, opacity: 0.4 }} contentStyle={ct.tooltipStyle} />
                    <Bar dataKey="successRate" name="Success Rate" radius={[0, 4, 4, 0]} barSize={20}>
                        <LabelList dataKey="successRate" position="right" fill={isDark ? "#e2e8f0" : "#475569"} fontSize={10} formatter={(val: unknown) => `${val}%`} />
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.successRate > 95 ? '#10b981' : entry.successRate > 90 ? '#f59e0b' : '#ef4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
