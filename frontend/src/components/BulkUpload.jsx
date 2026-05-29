import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

const BulkUpload = ({ onUpload }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});

    const onDrop = (acceptedFiles) => {
        setFiles(prev => [...prev, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const uploadAll = async () => {
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            
            const response = await fetch('http://localhost:5000/api/documents/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            setProgress(prev => ({ ...prev, [files[i].name]: 100 }));
        }
        setUploading(false);
        onUpload();
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                <p>Glissez-déposez plusieurs fichiers ici</p>
            </div>

            <AnimatePresence>
                {files.map((file, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                        <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {progress[file.name] && (
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress[file.name]}%` }} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {files.length > 0 && (
                <button
                    onClick={uploadAll}
                    disabled={uploading}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                    {uploading ? 'Upload en cours...' : `Uploader ${files.length} fichiers`}
                </button>
            )}
        </div>
    );
};