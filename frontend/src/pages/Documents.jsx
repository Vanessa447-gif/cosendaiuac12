import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { documentAPI } from '../services/api';
import DocumentModal from '../components/DocumentModal';
import { 
    MagnifyingGlassIcon, 
    TrashIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    DocumentTextIcon,
    PlusIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { currentService } = useService();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentService) {
            loadDocuments();
            loadCategories();
        }
    }, [search, currentService]);

    const loadDocuments = async () => {
        setLoading(true);
        const result = await documentAPI.getAll(0, 50, search, currentService?.id);
        if (result.success) setDocuments(result.documents || []);
        setLoading(false);
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${currentService?.id}/categories`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setCategories(data.categories);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleView = (doc) => {
        setSelectedDocument(doc);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce document ?')) return;
        const result = await documentAPI.delete(id);
        if (result.success) {
            toast.success('Document supprimé');
            loadDocuments();
        }
    };

    const handleDownload = async (doc) => {
        try {
            await fetch(`http://localhost:5000/api/documents/${doc.id}/download`, { method: 'POST' });
            window.open(`http://localhost:5000${doc.file_path}`, '_blank');
            toast.success('Téléchargement démarré');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec service */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{currentService?.icon}</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {language === 'fr' ? currentService?.name_fr : currentService?.name_en}
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                        {categories.length} catégories • {documents.length} documents
                    </p>
                </div>
                {(user?.role === 'admin' || user?.role === 'archiviste') && (
                    <button 
                        onClick={() => navigate('/upload')} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                        <PlusIcon className="h-5 w-5" /> Nouveau document
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Categories filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm whitespace-nowrap">
                    Tous
                </button>
                {categories.map(cat => (
                    <button key={cat.id} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-200">
                        {language === 'fr' ? cat.name_fr : cat.name_en}
                    </button>
                ))}
            </div>

            {/* Documents Grid */}
            {documents.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucun document dans ce service</p>
                    {(user?.role === 'admin' || user?.role === 'archiviste') && (
                        <button onClick={() => navigate('/upload')} className="mt-4 text-purple-600 hover:underline">
                            Uploader un document
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                            {/* Service indicator */}
                            <div className="h-1.5" style={{ backgroundColor: doc.service_color }}></div>
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                                {language === 'fr' ? doc.title_fr : doc.title_en}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                {language === 'fr' ? doc.description_fr : doc.description_en}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleView(doc)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl" title="Voir">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDownload(doc)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl" title="Télécharger">
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                        </button>
                                        {(user?.role === 'admin' || user?.role === 'archiviste') && (
                                            <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl" title="Supprimer">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                            {language === 'fr' ? doc.category_name_fr : doc.category_name_en}
                                        </span>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>📅 {new Date(doc.created_at).toLocaleDateString()}</span>
                                            <span>👁️ {doc.views_count}</span>
                                            <span>⬇️ {doc.downloads_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <DocumentModal
                document={selectedDocument}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedDocument(null);
                    loadDocuments();
                }}
                onRefresh={loadDocuments}
                user={user}
            />
        </div>
    );
};

export default Documents;