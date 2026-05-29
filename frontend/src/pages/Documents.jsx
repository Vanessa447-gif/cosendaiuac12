import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { documentAPI } from '../services/api';
import DocumentModal from '../components/DocumentModal';
import { 
    MagnifyingGlassIcon, 
    TrashIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    DocumentTextIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => { loadDocuments(); }, [search]);

    const loadDocuments = async () => {
        setLoading(true);
        const result = await documentAPI.getAll(0, 50, search);
        if (result.success) setDocuments(result.documents || []);
        setLoading(false);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📄 Gestion des documents</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez, consultez et archivez vos documents</p>
                </div>
                {(user?.role === 'admin' || user?.role === 'archiviste') && (
                    <button onClick={() => navigate('/upload')} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
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
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* Documents Grid */}
            {documents.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucun document trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                {language === 'fr' ? doc.title_fr : doc.title_en}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                {language === 'fr' ? doc.description_fr : doc.description_en}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Bouton VOIR 👁️ */}
                                        <button 
                                            onClick={() => handleView(doc)} 
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all" 
                                            title="Voir le document"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        {/* Bouton TÉLÉCHARGER ⬇️ */}
                                        <button 
                                            onClick={() => handleDownload(doc)} 
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all" 
                                            title="Télécharger"
                                        >
                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                        </button>
                                        {(user?.role === 'admin' || user?.role === 'archiviste') && (
                                            <button 
                                                onClick={() => handleDelete(doc.id)} 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                            {doc.category_name_fr}
                                        </span>
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <EyeIcon className="h-4 w-4" />
                                                <span>{doc.views_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ArrowDownTrayIcon className="h-4 w-4" />
                                                <span>{doc.downloads_count || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal pour voir le document */}
            <DocumentModal
                document={selectedDocument}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedDocument(null);
                    loadDocuments(); // Recharger pour mettre à jour les compteurs
                }}
                onRefresh={loadDocuments}
                user={user}
            />
        </div>
    );
};

export default Documents;