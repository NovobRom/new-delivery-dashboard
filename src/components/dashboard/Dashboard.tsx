import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { selectFilteredRecords } from '../../store/selectors';
import { calculateKPIs } from '../../utils/analytics';
import { KpiCard } from './KpiCard';
import { FilterBar } from './FilterBar';
import { TrendChart } from './charts/TrendChart';
import { CourierChart } from './charts/CourierChart';
import { MethodChart } from './charts/MethodChart';
import { RegionalChart } from './charts/RegionalChart';
import { DensityChart } from './charts/DensityChart';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { Package, CheckCircle2, AlertCircle, Hand, MapPin, BarChart3, Users, ClipboardList } from 'lucide-react';

export function Dashboard() {
    const { t } = useTranslation();
    const records = useAppSelector(selectFilteredRecords);

    // Memoize calculations to prevent re-run on every render unless records change
    const kpis = useMemo(() => calculateKPIs(records), [records]);

    return (
        <div className="space-y-6 pb-8">
            {/* Filters */}
            <FilterBar />

            {/* Primary KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title={t('kpi.totalLoaded')}
                    value={kpis.totalParcels.toLocaleString()}
                    icon={Package}
                    color="blue"
                    delay={0}
                />
                <KpiCard
                    title={t('kpi.deliveredOnDate')}
                    value={kpis.deliveredCount.toLocaleString()}
                    icon={CheckCircle2}
                    color="green"
                    delay={1}
                />
                <KpiCard
                    title={t('kpi.successRate')}
                    value={`${kpis.deliveryRate}%`}
                    icon={BarChart3}
                    color={kpis.deliveryRate > 95 ? "emerald" : "amber"}
                    delay={2}
                />
                <KpiCard
                    title={t('kpi.efficiency')}
                    value={kpis.efficiency.toFixed(2)}
                    icon={Users}
                    color="indigo"
                    delay={3}
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title={t('kpi.handDelivery')}
                    value={kpis.handDeliveryCount.toLocaleString()}
                    icon={Hand}
                    color="cyan"
                    delay={4}
                />
                <KpiCard
                    title={t('kpi.safePlace')}
                    value={kpis.safePlaceCount.toLocaleString()}
                    icon={MapPin}
                    color="teal"
                    delay={5}
                />
                <KpiCard
                    title={t('kpi.withReason')}
                    value={kpis.undeliveredWithReason.toLocaleString()}
                    icon={ClipboardList}
                    color="orange"
                    delay={6}
                    tooltip={
                        kpis.undeliveredWithReason > 0 ? (
                            <div className="space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1">{t('kpi.reasonsTitle')}</p>
                                <ul className="space-y-1 max-h-40 overflow-y-auto">
                                    {Object.entries(kpis.reasonsBreakdown).map(([reason, count]) => (
                                        <li key={reason} className="flex justify-between items-center text-xs">
                                            <span className="text-slate-600 dark:text-slate-300 truncate mr-2">{reason}</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null
                    }
                />
                <KpiCard
                    title={t('kpi.noReason')}
                    value={kpis.noReasonCount.toLocaleString()}
                    icon={AlertCircle}
                    color="red"
                    delay={7}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Volume Trend - A */}
                <div className="lg:col-span-2 min-h-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{t('charts.volumeTrend')}</h3>
                    <ErrorBoundary><TrendChart data={records} /></ErrorBoundary>
                </div>

                {/* Regional Comparison - B */}
                <div className="min-h-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{t('charts.regionalComparison')}</h3>
                    <ErrorBoundary><RegionalChart data={records} /></ErrorBoundary>
                </div>

                {/* Method Distribution - C */}
                <div className="min-h-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{t('charts.deliveryMethods')}</h3>
                    <ErrorBoundary><MethodChart data={records} /></ErrorBoundary>
                </div>

                {/* Courier Performance - D */}
                <div className="lg:col-span-2 min-h-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{t('charts.courierPerformance')}</h3>
                    <ErrorBoundary><CourierChart data={records} /></ErrorBoundary>
                </div>

                {/* Density - E */}
                <div className="lg:col-span-2 min-h-[350px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">{t('charts.deliveryDensity')}</h3>
                    <ErrorBoundary><DensityChart data={records} /></ErrorBoundary>
                </div>
            </div>
        </div>
    );
}
