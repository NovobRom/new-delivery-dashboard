import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DeliveryRecord } from '../../../types/schema';
import { Trophy, Medal, Star, ShieldCheck, Target } from 'lucide-react';

interface CourierRankingProps {
    records: DeliveryRecord[];
}

export function CourierRanking({ records }: CourierRankingProps) {
    const { t } = useTranslation();

    const rankings = useMemo(() => {
        // Aggregate stats per courier
        const stats = new Map<string, { total: number; delivered: number }>();

        records.forEach(c => {
            if (!c.courierId || c.courierId.trim() === '') return;
            const courier = c.courierId.trim();
            const isDelivered = c.status === 'Доставлено' || c.status.toLowerCase().includes('доставлено') && !c.status.toLowerCase().includes('не');

            const current = stats.get(courier) || { total: 0, delivered: 0 };
            current.total += 1;
            if (isDelivered) {
                current.delivered += 1;
            }
            stats.set(courier, current);
        });

        // Convert Map to array
        const couriersArray = Array.from(stats.entries()).map(([name, data]) => ({
            name,
            total: data.total,
            delivered: data.delivered,
            rate: data.total > 0 ? (data.delivered / data.total) * 100 : 0
        }));

        // Sort by Rate (min 5 total deliveries to qualify)
        const topByRate = [...couriersArray]
            .filter(c => c.total >= 5)
            .sort((a, b) => b.rate - a.rate || b.total - a.total) // tie-breaker: total
            .slice(0, 10);

        // Sort by Volume (delivered amount)
        const topByVolume = [...couriersArray]
            .sort((a, b) => b.delivered - a.delivered || b.rate - a.rate)
            .slice(0, 10);

        return { topByRate, topByVolume };
    }, [records]);

    const getMedalColor = (index: number) => {
        if (index === 0) return 'text-yellow-500 fill-yellow-500/20'; // Gold
        if (index === 1) return 'text-slate-400 fill-slate-400/20'; // Silver
        if (index === 2) return 'text-amber-700 fill-amber-700/20'; // Bronze
        return 'text-slate-300 dark:text-slate-600'; // Others
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header and Filter */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                    <Trophy className="text-yellow-500" size={28} />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {t('dashboard.courierRanking', 'Рейтинг Кур\'єрів')}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top by Success Rate */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <ShieldCheck className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {t('dashboard.topByRate', 'Топ за Успішністю')}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {t('dashboard.minDeliveries', 'Мінімум 5 завантажень')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rankings.topByRate.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">{t('app.noData', 'Немає даних')}</p>
                        ) : (
                            rankings.topByRate.map((courier, index) => (
                                <div key={courier.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-8">
                                            {index < 3 ? (
                                                <Medal size={28} className={getMedalColor(index)} />
                                            ) : (
                                                <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]" title={courier.name}>
                                                {courier.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {courier.delivered} з {courier.total} доставлено
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                            {courier.rate.toFixed(1)}%
                                        </div>
                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${courier.rate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top by Delivered Volume */}
                <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Target className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {t('dashboard.topByVolume', 'Топ за Об\'ємом')}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {t('dashboard.maxDelivered', 'Найбільше успішних доставок')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rankings.topByVolume.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">{t('app.noData', 'Немає даних')}</p>
                        ) : (
                            rankings.topByVolume.map((courier, index) => (
                                <div key={courier.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-8">
                                            {index < 3 ? (
                                                <Star size={24} className={getMedalColor(index)} />
                                            ) : (
                                                <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]" title={courier.name}>
                                                {courier.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Успішність: {courier.rate.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                            {courier.delivered} <span className="text-xs font-normal text-slate-500">{t('dashboard.parcelsShort', 'пос.')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
