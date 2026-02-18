import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './store/hooks';
import { Layout } from './components/layout/Layout';
import { UploadCloud } from 'lucide-react';
import { DataImport } from './components/wizard/DataImport';
import { Dashboard } from './components/dashboard/Dashboard';

function ImportPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-bounce">
        <UploadCloud size={48} className="text-brand-red" />
      </div>
      <h2 className="text-2xl font-bold">{t('app.noData')}</h2>
      <p className="text-slate-500 max-w-md">
        {t('app.noDataDescription')}
      </p>
      <DataImport />
    </div>
  );
}

function App() {
  const { theme } = useAppSelector((state) => state.ui);
  const { records } = useAppSelector((state) => state.data);

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
          element={records.length > 0 ? <Dashboard /> : <Navigate to="/import" replace />}
        />
        <Route path="/import" element={records.length > 0 ? <Navigate to="/" replace /> : <ImportPage />} />
        <Route path="/dashboard" element={records.length > 0 ? <Dashboard /> : <Navigate to="/import" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
