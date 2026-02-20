import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, UserX, X, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addExcludedCourier, removeExcludedCourier } from '../../store/slices/settingsSlice';

export function SettingsPage() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const excludedCouriers = useSelector((state: RootState) => state.settings.excludedCouriers);

    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = newName.trim();

        if (!cleanName) {
            setError(t('settings.emptyError'));
            return;
        }

        const isDuplicate = excludedCouriers.some(
            c => c.toLowerCase() === cleanName.toLowerCase()
        );

        if (isDuplicate) {
            setError(t('settings.duplicateError'));
            return;
        }

        dispatch(addExcludedCourier(cleanName));
        setNewName('');
        setError('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
                <Settings size={28} className="text-brand-red" />
                <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-brand-red">
                        <UserX size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {t('settings.excludedCouriers')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            {t('settings.excludedCouriersDesc')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                    <div className="flex-1">
                        <label className="sr-only">{t('settings.courierNameLabel')}</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder={t('settings.courierNamePlaceholder')}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-transparent dark:text-white transition-colors ${error
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-slate-200 dark:border-slate-700 focus:ring-brand-red/20 focus:border-brand-red'
                                }`}
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <button
                        type="submit"
                        className="flex outline-none items-center space-x-2 px-6 py-2 bg-brand-red hover:bg-red-600 text-white rounded-lg transition-colors h-[42px]"
                    >
                        <Plus size={20} />
                        <span>{t('settings.addCourier')}</span>
                    </button>
                </form>

                <div className="border border-slate-100 dark:border-slate-700/50 rounded-lg bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto p-4 flex flex-wrap gap-2 min-h-[100px] content-start">
                        {excludedCouriers.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center w-full py-4 mt-2">
                                {t('settings.emptyList')}
                            </p>
                        ) : (
                            excludedCouriers.map((courier, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm"
                                >
                                    <span>{courier}</span>
                                    <button
                                        type="button"
                                        onClick={() => dispatch(removeExcludedCourier(courier))}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-0.5 focus:outline-none"
                                        title={t('settings.remove')}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
