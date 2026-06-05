import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import TextEditor from '../components/TextEditor';
import { 
    MagnifyingGlassIcon, 
    TrashIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    DocumentTextIcon,
    PlusIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const { user } = useAuth();
    const { language } = useLanguage();
    const { service, refreshStats } = useService();
    const navigate = useNavigate();

    useEffect(() => {
        if (service) {
            loadDocuments();
        }
    }, [search, service]);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/documents?service_id=${service?.id}&search=${search}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (doc) => {
        setSelectedDocument(doc);
        setModalOpen(true);
    };

    // Fonction pour ouvrir l'éditeur en mode modification
    const handleEdit = (doc) => {
        console.log('📝 Modification du document:', doc);
        setEditingDocument(doc);
        setEditorOpen(true);
    };

    const handleNewDocument = () => {
        setEditingDocument(null);
        setEditorOpen(true);
    };

    const handleDownload = async (doc) => {
        try {
            const response = await fetch(`http://localhost:5000/api/documents/${doc.id}/download`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success && data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
                toast.success('Téléchargement démarré');
                loadDocuments();
            }
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            toast.error('Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce document ?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Document supprimé');
                loadDocuments();
                if (refreshStats) refreshStats();
            } else {
                toast.error(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{service?.icon}</span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {language === 'fr' ? service?.name_fr : service?.name_en}
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                        {documents.length} document(s)
                    </p>
                </div>
                <div className="flex gap-3">
                    {(user?.role === 'admin' || user?.role === 'archiviste') && (
                        <>
                            <button 
                                onClick={handleNewDocument}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                <PencilSquareIcon className="h-5 w-5" /> Nouveau document
                            </button>
                            <button 
                                onClick={() => navigate('/upload')} 
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                <PlusIcon className="h-5 w-5" /> Uploader un fichier
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un document..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* Liste des documents */}
            {documents.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <DocumentTextIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucun document dans ce service</p>
                    {(user?.role === 'admin' || user?.role === 'archiviste') && (
                        <div className="flex justify-center gap-4 mt-4">
                            <button onClick={handleNewDocument} className="text-green-600 hover:underline">
                                Créer un document
                            </button>
                            <button onClick={() => navigate('/upload')} className="text-purple-600 hover:underline">
                                Uploader un fichier
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
                            <div className="h-1.5" style={{ backgroundColor: service?.color }}></div>
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
                                                {doc.description_fr || 'Aucune description'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleView(doc)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl" title="Voir">
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleEdit(doc)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl" title="Modifier">
                                            <PencilSquareIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDownload(doc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Télécharger">
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
                                            {doc.category_name_fr || 'Sans catégorie'}
                                        </span>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>📅 {new Date(doc.created_at).toLocaleDateString()}</span>
                                            <span>👁️ {doc.views_count || 0}</span>
                                            <span>⬇️ {doc.downloads_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de visualisation */}
            {modalOpen && selectedDocument && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setModalOpen(false)} />
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
                            <h2 className="text-xl font-bold mb-4">{selectedDocument.title_fr}</h2>
                            <p className="text-gray-600 mb-4">{selectedDocument.description_fr || 'Aucune description'}</p>
                            <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Éditeur de texte */}
            {editorOpen && (
                <TextEditor
                    document={editingDocument}
                    onSave={() => {
                        setEditorOpen(false);
                        setEditingDocument(null);
                        loadDocuments();
                        if (refreshStats) refreshStats();
                    }}
                    onClose={() => {
                        setEditorOpen(false);
                        setEditingDocument(null);
                    }}
                />
            )}
        </div>
    );
};

export default Documents;