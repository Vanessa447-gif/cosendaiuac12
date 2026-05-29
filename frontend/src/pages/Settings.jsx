import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { 
    SunIcon, 
    MoonIcon, 
    GlobeAltIcon, 
    BellIcon, 
    ShieldCheckIcon, 
    UserCircleIcon,
    CheckIcon,
    LanguageIcon,
    ComputerDesktopIcon,
    KeyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [autoSave, setAutoSave] = useState(true);

    const handleSave = () => {
        toast.success('Paramètres enregistrés');
    };

    const SettingCard = ({ icon: Icon, title, description, children }) => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    {children}
                </div>
            </div>
        </div>
    );

    const ToggleSwitch = ({ enabled, onChange, label }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Paramètres</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Personnalisez votre expérience</p>
            </div>

            {/* Apparence */}
            <SettingCard icon={ComputerDesktopIcon} title="Apparence" description="Personnalisez l'affichage">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? <SunIcon className="h-5 w-5 text-yellow-500" /> : <MoonIcon className="h-5 w-5 text-indigo-500" />}
                            <span className="text-gray-700 dark:text-gray-300">{language === 'fr' ? 'Mode sombre' : 'Dark mode'}</span>
                        </div>
                        <ToggleSwitch enabled={theme === 'dark'} onChange={toggleTheme} />
                    </div>
                </div>
            </SettingCard>

            {/* Langue */}
            <SettingCard icon={LanguageIcon} title="Langue" description="Choisissez votre langue préférée">
                <div className="flex gap-3">
                    <button
                        onClick={() => { if (language !== 'fr') toggleLanguage(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${language === 'fr' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                    >
                        <GlobeAltIcon className="h-5 w-5" />
                        Français
                        {language === 'fr' && <CheckIcon className="h-5 w-5" />}
                    </button>
                    <button
                        onClick={() => { if (language !== 'en') toggleLanguage(); }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${language === 'en' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'}`}
                    >
                        <GlobeAltIcon className="h-5 w-5" />
                        English
                        {language === 'en' && <CheckIcon className="h-5 w-5" />}
                    </button>
                </div>
            </SettingCard>

            {/* Notifications */}
            <SettingCard icon={BellIcon} title="Notifications" description="Gérez vos alertes">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Notifications push</p>
                            <p className="text-sm text-gray-500">Recevez des alertes sur vos documents</p>
                        </div>
                        <ToggleSwitch enabled={notifications} onChange={() => setNotifications(!notifications)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Sauvegarde automatique</p>
                            <p className="text-sm text-gray-500">Sauvegarde automatique des modifications</p>
                        </div>
                        <ToggleSwitch enabled={autoSave} onChange={() => setAutoSave(!autoSave)} />
                    </div>
                </div>
            </SettingCard>

            {/* Sécurité */}
            <SettingCard icon={ShieldCheckIcon} title="Sécurité" description="Protégez votre compte">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <KeyIcon className="h-5 w-5 text-yellow-500" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Mot de passe</p>
                                <p className="text-sm text-gray-500">Dernière modification : il y a 2 mois</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                            Modifier
                        </button>
                    </div>
                </div>
            </SettingCard>

            {/* Informations */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                            <UserCircleIcon className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{user?.full_name || user?.fullName}</h3>
                            <p className="text-purple-200">@{user?.username}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-purple-200">
                                <span>{user?.email}</span>
                                <span>•</span>
                                <span className="capitalize">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                    💾 Enregistrer les modifications
                </button>
            </div>
        </div>
    );
};

export default Settings;