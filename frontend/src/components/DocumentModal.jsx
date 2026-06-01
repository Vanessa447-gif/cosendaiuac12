import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, ArrowDownTrayIcon, DocumentTextIcon, CalendarIcon, UserIcon, FolderIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DocumentModal = ({ document, isOpen, onClose, onRefresh, user }) => {
    const [loading, setLoading] = useState(false);

    const openFile = () => {
        if (!document) return;
        const fileUrl = `http://localhost:5000${document.file_path}`;
        window.open(fileUrl, '_blank');
        
        // Incrémenter les vues en arrière-plan
        fetch(`http://localhost:5000/api/documents/${document.id}/view`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(console.error);
    };

    const handleDownload = async () => {
        if (!document) return;
        try {
            await fetch(`http://localhost:5000/api/documents/${document.id}/download`, { 
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            openFile();
            toast.success('Document ouvert');
            if (onRefresh) onRefresh();
        } catch (error) {
            toast.error('Erreur');
        }
    };

    if (!isOpen || !document) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">📄 Détails du document</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h3 className="text-xl font-bold">{document.title_fr}</h3>
                                <p className="text-sm text-gray-500 mt-1">{document.title_en}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <FolderIcon className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Catégorie</p>
                                        <p className="font-medium">{document.category_name_fr}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <UserIcon className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Uploadé par</p>
                                        <p className="font-medium">{document.uploader_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <CalendarIcon className="h-5 w-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="font-medium">{new Date(document.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <DocumentTextIcon className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Taille</p>
                                        <p className="font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-600">{document.description_fr || 'Aucune description'}</p>
                            </div>

                            <div className="flex justify-around p-4 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">{document.views_count || 0}</p>
                                    <p className="text-xs text-gray-500">Vues</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{document.downloads_count || 0}</p>
                                    <p className="text-xs text-gray-500">Téléchargements</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-6 py-4 flex justify-end gap-3">
                        <button onClick={openFile} className="px-4 py-2 bg-purple-500 text-white rounded-xl flex items-center gap-2">
                            <EyeIcon className="h-5 w-5" /> Voir le fichier
                        </button>
                        <button onClick={handleDownload} className="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2">
                            <ArrowDownTrayIcon className="h-5 w-5" /> Télécharger
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;