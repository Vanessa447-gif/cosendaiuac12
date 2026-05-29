import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { documentAPI } from '../services/api';
import { 
    CloudArrowUpIcon, 
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Upload = () => {
    const [title_fr, setTitleFr] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [description_fr, setDescriptionFr] = useState('');
    const [description_en, setDescriptionEn] = useState('');
    const [categoryId, setCategoryId] = useState('1');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const categories = [
        { id: 1, name_fr: '📁 Dossiers étudiants', name_en: '📁 Student Files' },
        { id: 2, name_fr: '📊 Notes et résultats', name_en: '📊 Grades & Results' },
        { id: 3, name_fr: '✉️ Correspondances', name_en: '✉️ Correspondence' },
        { id: 4, name_fr: '📋 Documents administratifs', name_en: '📋 Administrative' },
        { id: 5, name_fr: '🤝 Conventions', name_en: '🤝 Agreements' },
    ];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile.size > 50 * 1024 * 1024) {
            toast.error('Le fichier ne doit pas dépasser 50 MB');
            return;
        }
        const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(ext)) {
            toast.error('Type de fichier non autorisé');
            return;
        }
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title_fr || !title_en || !file) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setUploading(true);
        const uploadResult = await documentAPI.upload(file);
        if (!uploadResult.success) {
            toast.error(uploadResult.message);
            setUploading(false);
            return;
        }

        const documentData = {
            title_fr, title_en,
            description_fr: description_fr || '',
            description_en: description_en || '',
            categoryId: parseInt(categoryId),
            fileName: uploadResult.fileName,
            filePath: uploadResult.filePath,
            fileSize: uploadResult.fileSize,
            fileType: uploadResult.fileType,
            uploadedBy: user.id
        };

        const result = await documentAPI.create(documentData);
        if (result.success) {
            toast.success('Document uploadé avec succès !');
            setTimeout(() => navigate('/documents'), 1500);
        } else {
            toast.error(result.message);
        }
        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => navigate('/documents')}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Retour aux documents
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📤 Uploader un document</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Ajoutez un nouveau document à l'archive</p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        {/* Section Informations */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <DocumentTextIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Informations du document</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Remplissez les détails ci-dessous</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Titre (Français) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title_fr}
                                        onChange={(e) => setTitleFr(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Rapport annuel 2024"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Title (English) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title_en}
                                        onChange={(e) => setTitleEn(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        placeholder="Ex: Annual Report 2024"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Français)
                                    </label>
                                    <textarea
                                        value={description_fr}
                                        onChange={(e) => setDescriptionFr(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Description détaillée du document..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (English)
                                    </label>
                                    <textarea
                                        value={description_en}
                                        onChange={(e) => setDescriptionEn(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Detailed document description..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catégorie
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {language === 'fr' ? cat.name_fr : cat.name_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section Upload */}
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                                    <CloudArrowUpIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fichier</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Glissez-déposez votre fichier ou cliquez pour sélectionner</p>
                                </div>
                            </div>

                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                                    ${dragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'}
                                    ${file ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}
                                `}
                                onClick={() => !file && document.getElementById('file-input').click()}
                            >
                                <input id="file-input" type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                                
                                {!file ? (
                                    <>
                                        <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            {dragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier ici'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            ou <span className="text-purple-600 hover:underline">cliquez pour sélectionner</span>
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                                            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max: 50 MB)
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-3">
                                        <CheckCircleIcon className="h-10 w-10 text-green-500" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <XCircleIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex gap-4">
                            <button
                                type="submit"
                                disabled={uploading}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Upload en cours...
                                    </span>
                                ) : (
                                    '📤 Uploader le document'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/documents')}
                                className="px-8 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-all"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Upload;