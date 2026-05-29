import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

const AdvancedSearch = ({ onSearch, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date_desc',
    status: ''
  });
  const { language } = useLanguage();

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      category: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date_desc',
      status: ''
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <FunnelIcon className="h-5 w-5" />
        <span>Filtres avancés</span>
        {Object.values(filters).some(v => v) && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtres</h3>
            <button onClick={() => setIsOpen(false)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              >
                <option value="">Toutes</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'fr' ? cat.name_fr : cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Date du</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Date au</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Trier par</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              >
                <option value="date_desc">Plus récent</option>
                <option value="date_asc">Plus ancien</option>
                <option value="views_desc">Plus consulté</option>
                <option value="downloads_desc">Plus téléchargé</option>
                <option value="title_asc">Titre A-Z</option>
              </select>
            </div>

            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;