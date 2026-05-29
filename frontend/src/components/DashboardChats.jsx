import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const DashboardCharts = ({ stats }) => {
  const { language } = useLanguage();

  // Données pour les graphiques
  const categoryData = stats?.documentsByCategory?.map(cat => ({
    name: language === 'fr' ? cat.name_fr : cat.name_en,
    value: cat.count || 0,
    color: cat.color || '#3b82f6'
  })) || [];

  const monthlyData = [
    { month: 'Jan', documents: 12, views: 45 },
    { month: 'Fév', documents: 19, views: 67 },
    { month: 'Mar', documents: 25, views: 89 },
    { month: 'Avr', documents: 18, views: 56 },
    { month: 'Mai', documents: 32, views: 120 },
    { month: 'Juin', documents: 28, views: 98 },
  ];

  if (categoryData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Graphique en barres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 {language === 'fr' ? 'Documents par catégorie' : 'Documents by category'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6">
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique circulaire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🥧 {language === 'fr' ? 'Répartition des documents' : 'Document distribution'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tendance d'évolution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 {language === 'fr' ? 'Évolution des activités' : 'Activity trend'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="documents" stroke="#3b82f6" name={language === 'fr' ? 'Documents' : 'Documents'} />
            <Line yAxisId="right" type="monotone" dataKey="views" stroke="#10b981" name={language === 'fr' ? 'Vues' : 'Views'} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;