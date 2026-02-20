import { useAppSelector } from '../../store/hooks';
import { createDatasetSelectors } from '../../store/selectors';
import { FilterBar } from '../dashboard/FilterBar';
import { CourierRanking } from '../dashboard/charts/CourierRanking';

export function DashboardPage() {
    const { selectFilteredRecords } = createDatasetSelectors('deliveries');
    const records = useAppSelector(selectFilteredRecords);

    return (
        <div className="space-y-6 pb-8">
            {/* Filters */}
            <FilterBar target="deliveries" />

            <div className="grid grid-cols-1 gap-6">
                {/* Gamification / Rankings */}
                <CourierRanking records={records} />
            </div>
        </div>
    );
}
