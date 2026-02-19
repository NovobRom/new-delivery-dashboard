import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './store/hooks';
import { selectHasAnyData } from './store/selectors';
import { Layout } from './components/layout/Layout';
import { UploadCloud } from 'lucide-react';
import { DataImport } from './components/wizard/DataImport';
import { DashboardPage } from './components/pages/DashboardPage';
import { DeliveryAnalysisPage } from './components/pages/DeliveryAnalysisPage';
import { PickupAnalysisPage } from './components/pages/PickupAnalysisPage';
import { CouriersPage } from './components/pages/CouriersPage';
import { SettingsPage } from './components/pages/SettingsPage';

function ImportPage() {
  const { t } = useTranslation();
  const hasData = useAppSelector(selectHasAnyData);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-8">
      {!hasData && (
        <>
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-bounce">
            <UploadCloud size={48} className="text-brand-red" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t('app.noData')}</h2>
            <p className="text-slate-500 max-w-md mt-2">
              {t('app.noDataDescription')}
            </p>
          </div>
        </>
      )}
      {hasData && (
        <div>
          <h2 className="text-xl font-bold">{t('sidebar.import')}</h2>
          <p className="text-slate-500 max-w-md mt-1 text-sm">
            {t('app.noDataDescription')}
          </p>
        </div>
      )}
      <DataImport />
    </div>
  );
}

function App() {
  const { theme } = useAppSelector((state) => state.ui);
  const hasData = useAppSelector(selectHasAnyData);

  // Sync theme with HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={hasData ? <DashboardPage /> : <Navigate to="/import" replace />}
        />
        {/* Import is always accessible — users can load deliveries AND pickups independently */}
        <Route path="/import" element={<ImportPage />} />
        <Route path="/dashboard" element={hasData ? <DashboardPage /> : <Navigate to="/import" replace />} />
        <Route path="/delivery-analysis" element={hasData ? <DeliveryAnalysisPage /> : <Navigate to="/import" replace />} />
        <Route path="/pickup-analysis" element={hasData ? <PickupAnalysisPage /> : <Navigate to="/import" replace />} />
        <Route path="/couriers" element={hasData ? <CouriersPage /> : <Navigate to="/import" replace />} />
        <Route path="/settings" element={hasData ? <SettingsPage /> : <Navigate to="/import" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
