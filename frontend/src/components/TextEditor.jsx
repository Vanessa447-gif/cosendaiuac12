import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'check',
    'indent', 'align', 'link', 'image'
];

const TextEditor = ({ document: initialDocument, onSave, onClose }) => {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { service } = useService();
    const { language } = useLanguage();

    // Charger le document quand on ouvre l'éditeur
    useEffect(() => {
        const loadDocument = async () => {
            // Si on a un document à modifier
            if (initialDocument?.id) {
                setLoading(true);
                try {
                    console.log('📖 Chargement du document:', initialDocument.id);
                    
                    // Récupérer le contenu complet du document
                    const response = await fetch(`http://localhost:5000/api/editor/documents/${initialDocument.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    });
                    
                    const data = await response.json();
                    console.log('📦 Document chargé:', data);
                    
                    if (data.success) {
                        // Utiliser le titre existant
                        const docTitle = language === 'fr' ? data.document.title_fr : data.document.title_en;
                        setTitle(docTitle || initialDocument.title_fr || 'Sans titre');
                        // Utiliser le contenu existant
                        setContent(data.document.content || initialDocument.content || '');
                    } else {
                        // Fallback sur les données passées en props
                        setTitle(initialDocument.title_fr || 'Sans titre');
                        setContent(initialDocument.content || '');
                    }
                } catch (error) {
                    console.error('Erreur chargement:', error);
                    // Fallback
                    setTitle(initialDocument.title_fr || 'Sans titre');
                    setContent(initialDocument.content || '');
                } finally {
                    setLoading(false);
                }
            } else {
                // Nouveau document
                setTitle('');
                setContent('');
            }
        };

        loadDocument();
    }, [initialDocument, language]);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Veuillez saisir un titre');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('service_id', service.id);
            formData.append('user_id', user.id);

            let response;
            if (initialDocument?.id) {
                // Mise à jour du document existant
                console.log('✏️ Mise à jour du document:', initialDocument.id);
                response = await fetch(`http://localhost:5000/api/editor/documents/${initialDocument.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
            } else {
                // Création d'un nouveau document
                console.log('📝 Création d\'un nouveau document');
                response = await fetch('http://localhost:5000/api/editor/documents', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
            }

            const data = await response.json();
            if (data.success) {
                toast.success(initialDocument?.id ? 'Document mis à jour' : 'Document créé');
                if (onSave) onSave(data.document);
                if (onClose) onClose();
            } else {
                toast.error(data.message || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'document'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Document exporté');
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-black bg-opacity-50" />
                <div className="relative min-h-screen flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                        <p className="text-center mt-4">Chargement du document...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {initialDocument?.id ? '✏️ Modifier le document' : '📝 Nouveau document'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Titre du document"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Éditeur */}
                    <div className="p-6 h-[calc(90vh-180px)] overflow-y-auto">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            placeholder="Commencez à écrire votre document..."
                            className="h-full"
                        />
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-6 py-4 flex justify-end gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-gray-500 text-white rounded-xl flex items-center gap-2 hover:bg-gray-600 transition-colors"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            Exporter HTML
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-400 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
                        >
                            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextEditor;