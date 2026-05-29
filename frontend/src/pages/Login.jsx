import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authAPI } from '../services/api';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme, accentColor, THEMES } = useTheme();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await authAPI.login(username, password);
    
    if (result.success) {
      toast.success(t('loginSuccess'));
      login(result.user, result.token);
      navigate('/dashboard');
    } else {
      toast.error(t('loginError'));
    }
    
    setLoading(false);
  };

  const fillDemo = (user) => {
    setUsername(user.username);
    setPassword(user.password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${THEMES[accentColor].primary}, ${THEMES[accentColor].primaryDark})`
      }}
    >
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={toggleLanguage}
          className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
        >
          <GlobeAltIcon className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
        >
          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${THEMES[accentColor].primary}, ${THEMES[accentColor].primaryDark})`
            }}
          >
            <span className="text-white text-4xl font-bold">R</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registrariat SAE
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder={t('username')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder={t('password')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-dynamic disabled:opacity-50"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('testAccounts')} :
          </p>
          <div className="space-y-2 text-sm">
            <button
              onClick={() => fillDemo({ username: 'admin', password: 'admin123' })}
              className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <span className="font-medium">Admin :</span> admin / admin123
            </button>
            <button
              onClick={() => fillDemo({ username: 'archiviste', password: 'archiviste123' })}
              className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <span className="font-medium">Archiviste :</span> archiviste / archiviste123
            </button>
            <button
              onClick={() => fillDemo({ username: 'consultant', password: 'consultant123' })}
              className="w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <span className="font-medium">Consultant :</span> consultant / consultant123
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;