import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, PresentationChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../contexts/LanguageContext';

const DragDropUpload = ({ onFileSelect, file, multiple = false }) => {
  const { t, language } = useLanguage();

  // Fonction pour obtenir l'icône selon le type de fichier
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
      return <PhotoIcon className="h-8 w-8 text-green-500" />;
    }
    if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
      return <TableCellsIcon className="h-8 w-8 text-green-500" />;
    }
    if (['ppt', 'pptx'].includes(ext)) {
      return <PresentationChartBarIcon className="h-8 w-8 text-orange-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-blue-500" />;
  };

  // Fonction pour obtenir le type de fichier en français
  const getFileTypeName = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    const types = {
      'doc': 'Word Document',
      'docx': 'Word Document',
      'xls': 'Excel Spreadsheet',
      'xlsx': 'Excel Spreadsheet',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'pdf': 'PDF Document',
      'txt': 'Text File',
      'jpg': 'Image',
      'jpeg': 'Image',
      'png': 'Image',
      'gif': 'Image',
      'zip': 'Archive',
      'rar': 'Archive',
    };
    return types[ext] || 'Document';
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      alert(`Fichier refusé: ${error.message}`);
      return;
    }
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize: 100 * 1024 * 1024, // 100 MB
  });

  if (file) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(file.name)}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileTypeName(file.name)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className={`h-16 w-16 mx-auto mb-4 transition-colors ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
      {isDragActive ? (
        <p className="text-blue-500 font-medium">Déposez le fichier ici</p>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Glissez-déposez votre fichier ici
          </p>
          <p className="text-sm text-gray-500">
            ou <span className="text-blue-500 hover:underline">cliquez pour sélectionner</span>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            📄 Word • 📊 Excel • 📽️ PowerPoint • 📑 PDF • 🖼️ Images • 📦 Archives
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Taille max: 100 MB
          </p>
        </>
      )}
    </div>
  );
};

export default DragDropUpload;