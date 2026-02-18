export function getChartTheme(isDark: boolean) {
    return {
        gridStroke: isDark ? '#374151' : '#e2e8f0',
        axisStroke: isDark ? '#94a3b8' : '#64748b',
        tooltipStyle: {
            backgroundColor: isDark ? '#1e293b' : '#fff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderRadius: '8px',
            color: isDark ? '#f8fafc' : '#0f172a',
        },
        cursorFill: isDark ? '#334155' : '#f1f5f9',
    };
}
