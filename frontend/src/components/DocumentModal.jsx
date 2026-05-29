import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DocumentModal = ({ document: initialDocument, isOpen, onClose, onRefresh, user }) => {
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(initialDocument);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen && initialDocument) {
      loadDocumentWithViews(initialDocument.id);
    }
  }, [isOpen, initialDocument]);

  useEffect(() => {
    if (document) {
      setFormData({
        title_fr: document.title_fr || '',
        title_en: document.title_en || '',
        description_fr: document.description_fr || '',
        description_en: document.description_en || '',
        category_id: document.category_id || ''
      });
    }
    fetchCategories();
  }, [document]);

  const loadDocumentWithViews = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setDocument(data.document);
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.message || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // VERSION CORRIGÉE DU TÉLÉCHARGEMENT
  const handleDownload = async () => {
    if (!document) return;
    
    try {
      // Incrémenter le compteur
      await fetch(`http://localhost:5000/api/documents/${document.id}/download`, {
        method: 'POST'
      });
      
      // Ouvrir dans un nouvel onglet (alternative plus fiable)
      window.open(`http://localhost:5000${document.file_path}`, '_blank');
      
      toast.success('Document ouvert');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce document définitivement ?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${document.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Document supprimé');
        onClose();
        if (onRefresh) onRefresh();
      } else {
        toast.error('Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Document modifié');
        setIsEditing(false);
        await loadDocumentWithViews(document.id);
        if (onRefresh) onRefresh();
        setTimeout(() => onClose(), 1000);
      } else {
        toast.error('Erreur');
      }
    } catch (error) {
      toast.error('Erreur');
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative min-h-screen flex items-center justify-center p-4"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Modifier' : 'Détails du document'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              {loading && !document ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Titre (Français) *</label>
                      <input value={formData.title_fr} onChange={e => setFormData({...formData, title_fr: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Title (English) *</label>
                      <input value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Catégorie</label>
                    <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                      <option value="">Sélectionnez</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{language === 'fr' ? cat.name_fr : cat.name_en}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : document ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Catégorie</p>
                        <p className="font-medium">{language === 'fr' ? document.category_name_fr : document.category_name_en}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <UserIcon className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Uploadé par</p>
                        <p className="font-medium">{document.uploader_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{formatDate(document.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Taille</p>
                        <p className="font-medium">{formatFileSize(document.file_size)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p>{language === 'fr' ? document.description_fr || 'Aucune description' : document.description_en || 'No description'}</p>
                  </div>
                  
                  <div className="flex justify-around p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{document.views_count || 0}</p>
                      <p className="text-xs text-gray-500">Vues</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{document.downloads_count || 0}</p>
                      <p className="text-xs text-gray-500">Téléchargements</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            {/* Footer avec les boutons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-6 py-4 flex justify-end space-x-3">
              {!isEditing ? (
                <>
                  <button 
                    onClick={() => window.open(`http://localhost:5000${document?.file_path}`, '_blank')} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                  >
                    <EyeIcon className="h-5 w-5" /><span>Voir</span>
                  </button>
                  <button 
                    onClick={handleDownload} 
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" /><span>Télécharger</span>
                  </button>
                  {(user?.role === 'admin' || user?.role === 'archiviste') && (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-2"
                      >
                        <PencilIcon className="h-5 w-5" /><span>Modifier</span>
                      </button>
                      <button 
                        onClick={handleDelete} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
                      >
                        <TrashIcon className="h-5 w-5" /><span>Supprimer</span>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleUpdate} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Enregistrer
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentModal;