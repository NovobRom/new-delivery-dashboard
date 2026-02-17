import { useEffect } from 'react';
import { useAppSelector } from './store/hooks';
import { Layout } from './components/layout/Layout';
import { UploadCloud } from 'lucide-react';
import { DataImport } from './components/wizard/DataImport';
import { Dashboard } from './components/dashboard/Dashboard';

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

  // Placeholder content based on state
  return (
    <Layout>
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-bounce">
            <UploadCloud size={48} className="text-brand-red" />
          </div>
          <h2 className="text-2xl font-bold">No Data Loaded</h2>
          <p className="text-slate-500 max-w-md">
            Please import your "Detailed Table" CSV file to start analyzing the logistics performance.
          </p>
          <DataImport />
        </div>
      ) : (
        <Dashboard />
      )}
    </Layout>
  );
}

export default App;
