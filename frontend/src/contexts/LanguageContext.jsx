import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const translations = {
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    documents: 'Documents',
    upload: 'Uploader',
    users: 'Utilisateurs',
    logout: 'Déconnexion',
    
    // Actions
    search: 'Rechercher...',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    
    // Messages
    loading: 'Chargement...',
    noDocuments: 'Aucun document trouvé',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce document ?',
    
    // Authentification
    login: 'Se connecter',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    loginSuccess: 'Connexion réussie !',
    loginError: 'Nom d\'utilisateur ou mot de passe incorrect',
    
    // Dashboard
    totalDocuments: 'Total documents',
    totalViews: 'Vues totales',
    totalDownloads: 'Téléchargements',
    activeUsers: 'Utilisateurs actifs',
    recentDocuments: 'Documents récents',
    recentActivities: 'Activités récentes',
    documentsByCategory: 'Documents par catégorie',
    
    // Upload
    title: 'Titre',
    description: 'Description',
    category: 'Catégorie',
    file: 'Fichier',
    selectFile: 'Sélectionner un fichier',
    uploadSuccess: 'Document uploadé avec succès !',
    
    // Roles
    admin: 'Administrateur',
    archiviste: 'Archiviste',
    consultant: 'Consultant',
    
    // Theme
    lightMode: 'Mode clair',
    darkMode: 'Mode sombre',
    
    // Pagination
    previous: 'Précédent',
    next: 'Suivant',
    page: 'Page',
    of: 'sur',
    
    // Test accounts
    testAccounts: 'Comptes de test',
    
    // Welcome
    welcome: 'Bonjour',
  },
  
  en: {
    // Navigation
    dashboard: 'Dashboard',
    documents: 'Documents',
    upload: 'Upload',
    users: 'Users',
    logout: 'Logout',
    
    // Actions
    search: 'Search...',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel',
    
    // Messages
    loading: 'Loading...',
    noDocuments: 'No documents found',
    deleteConfirm: 'Are you sure you want to delete this document?',
    
    // Authentification
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginSuccess: 'Login successful!',
    loginError: 'Invalid username or password',
    
    // Dashboard
    totalDocuments: 'Total documents',
    totalViews: 'Total views',
    totalDownloads: 'Downloads',
    activeUsers: 'Active users',
    recentDocuments: 'Recent documents',
    recentActivities: 'Recent activities',
    documentsByCategory: 'Documents by category',
    
    // Upload
    title: 'Title',
    description: 'Description',
    category: 'Category',
    file: 'File',
    selectFile: 'Select file',
    uploadSuccess: 'Document uploaded successfully!',
    
    // Roles
    admin: 'Administrator',
    archiviste: 'Archivist',
    consultant: 'Consultant',
    
    // Theme
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    
    // Pagination
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    
    // Test accounts
    testAccounts: 'Test accounts',
    
    // Welcome
    welcome: 'Hello',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('language');
    return savedLang || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'fr' ? 'en' : 'fr');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};