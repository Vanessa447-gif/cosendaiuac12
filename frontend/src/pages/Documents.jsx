import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
    MagnifyingGlassIcon, 
    TrashIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    DocumentTextIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Configuration de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
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
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/documents?service_id=${service?.id}&search=${search}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    // 👁️ Fonction pour VOIR un document (incrémente les vues)
    const handleView = async (doc) => {
        try {
            const token = localStorage.getItem('token');
            
            // Appel pour incrémenter les vues
            const response = await fetch(`http://localhost:5000/api/documents/${doc.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success) {
                // Si c'est un PDF, ouvrir dans le modal
                if (doc.file_type === 'application/pdf') {
                    setSelectedDocument(doc);
                    setPdfModalOpen(true);
                    setPageNumber(1);
                } else {
                    // Pour les autres fichiers, ouverture classique
                    window.open(`http://localhost:5000${doc.file_path}`, '_blank');
                }
                loadDocuments();
                if (refreshStats) refreshStats();
                toast.success('Document ouvert');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur');
        }
    };

    // ⬇️ Fonction pour TÉLÉCHARGER (incrémente les téléchargements)
    const handleDownload = async (doc) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:5000/api/documents/${doc.id}/download`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (data.success && data.downloadUrl) {
                // Téléchargement forcé
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.download = doc.file_name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                loadDocuments();
                if (refreshStats) refreshStats();
                toast.success('Téléchargement démarré');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce document ?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Document supprimé');
                loadDocuments();
                if (refreshStats) refreshStats();
            }
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const goToPrevPage = () => {
        setPageNumber(pageNumber - 1);
    };

    const goToNextPage = () => {
        setPageNumber(pageNumber + 1);
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
                        <button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
                            <PlusIcon className="h-5 w-5" /> Uploader
                        </button>
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
                                            {doc.category_name_fr || 'Sans catégorie'}
                                        </span>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>👁️ {doc.views_count || 0}</span>
                                            <span>⬇️ {doc.downloads_count || 0}</span>
                                            <span>📅 {new Date(doc.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de visualisation PDF */}
            {pdfModalOpen && selectedDocument && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setPdfModalOpen(false)} />
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            {/* Header du modal */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {language === 'fr' ? selectedDocument.title_fr : selectedDocument.title_en}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedDocument.views_count || 0} vues • {selectedDocument.downloads_count || 0} téléchargements
                                    </p>
                                </div>
                                <button onClick={() => setPdfModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Contrôles PDF */}
                            <div className="sticky top-[73px] bg-white dark:bg-gray-800 border-b px-6 py-3 flex justify-center gap-4">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all"
                                >
                                    ◀ Précédent
                                </button>
                                <span className="px-4 py-2">
                                    Page {pageNumber} sur {numPages}
                                </span>
                                <button
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all"
                                >
                                    Suivant ▶
                                </button>
                                <button
                                    onClick={() => handleDownload(selectedDocument)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                    Télécharger
                                </button>
                            </div>

                            {/* Visualisation PDF */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)] flex justify-center">
                                <Document
                                    file={`http://localhost:5000${selectedDocument.file_path}`}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={<div className="text-center py-12">Chargement du PDF...</div>}
                                    error={<div className="text-center py-12 text-red-500">Erreur de chargement du PDF</div>}
                                >
                                    <Page pageNumber={pageNumber} scale={1.2} />
                                </Document>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;