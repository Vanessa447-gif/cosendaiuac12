import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { documentAPI } from '../services/api';
import { CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Upload = () => {
    const [title_fr, setTitleFr] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [description_fr, setDescriptionFr] = useState('');
    const [description_en, setDescriptionEn] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const { language } = useLanguage();
    const { service, refreshStats } = useService();
    const navigate = useNavigate();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            console.log('🔍 Chargement des catégories...');
            const response = await fetch('http://localhost:5000/api/services/categories', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            console.log('📦 Catégories reçues:', data);
            
            if (data.success && data.categories) {
                setCategories(data.categories);
                if (data.categories.length > 0) {
                    setCategoryId(data.categories[0].id.toString());
                }
            } else {
                console.error('Aucune catégorie trouvée');
            }
        } catch (error) {
            console.error('Erreur chargement catégories:', error);
            toast.error('Erreur de chargement des catégories');
        }
    };

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
        if (!title_fr || !title_en || !file || !categoryId) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setUploading(true);
        
        try {
            // 1. Upload du fichier
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await fetch('http://localhost:5000/api/documents/upload', {
                method: 'POST',
                body: formData
            });
            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.message || "Erreur lors de l'upload");
            }
            
            // 2. Création du document
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
            
            const docResponse = await fetch('http://localhost:5000/api/documents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(documentData)
            });
            const docResult = await docResponse.json();
            
            if (docResult.success) {
                toast.success('Document uploadé avec succès !');
                if (refreshStats) refreshStats();
                setTimeout(() => navigate('/documents'), 1500);
            } else {
                throw new Error(docResult.message || "Erreur lors de la création");
            }
        } catch (error) {
            console.error('Erreur:', error);
            toast.error(error.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/documents')} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 mb-6">
                <ArrowLeftIcon className="h-4 w-4" /> Retour aux documents
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{service?.icon}</span>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Uploader un document - {language === 'fr' ? service?.name_fr : service?.name_en}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Ajoutez un nouveau document à l'archive du service
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Titre (Français) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title_fr}
                                onChange={(e) => setTitleFr(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
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
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Annual Report 2024"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description (Français)
                            </label>
                            <textarea
                                value={description_fr}
                                onChange={(e) => setDescriptionFr(e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
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
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Detailed document description..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catégorie <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
                            required
                        >
                            <option value="">Sélectionnez une catégorie</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {language === 'fr' ? cat.name_fr : cat.name_en}
                                </option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-sm text-red-500 mt-1">Aucune catégorie disponible pour ce service</p>
                        )}
                    </div>

                    {/* Upload area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fichier <span className="text-red-500">*</span>
                        </label>
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
                                    <p className="text-xs text-gray-400 mt-4">
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
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Upload en cours...' : '📤 Uploader le document'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/documents')}
                            className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Upload;