import React, { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const TagManager = ({ tags, onAddTag, onRemoveTag }) => {
    const [newTag, setNewTag] = useState('');
    const [showInput, setShowInput] = useState(false);

    const colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800',
        'bg-yellow-100 text-yellow-800',
        'bg-purple-100 text-purple-800',
        'bg-pink-100 text-pink-800',
        'bg-indigo-100 text-indigo-800'
    ];

    const handleAdd = () => {
        if (newTag.trim()) {
            onAddTag(newTag.trim());
            setNewTag('');
            setShowInput(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {tags?.map((tag, index) => (
                <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${colors[index % colors.length]}`}
                >
                    #{tag}
                    <button onClick={() => onRemoveTag(tag)} className="hover:opacity-70">
                        <XMarkIcon className="h-3 w-3" />
                    </button>
                </span>
            ))}
            
            {showInput ? (
                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="px-2 py-1 text-sm border rounded-lg"
                        placeholder="Nouveau tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    <button onClick={handleAdd} className="p-1 bg-blue-500 text-white rounded">
                        <PlusIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setShowInput(false)} className="p-1 text-gray-500">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowInput(true)}
                    className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-1"
                >
                    <PlusIcon className="h-4 w-4" />
                    Ajouter un tag
                </button>
            )}
        </div>
    );
};