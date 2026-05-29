import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckIcon } from '@heroicons/react/24/outline';

const ColorPicker = () => {
    const { accentColor, changeAccentColor, THEMES } = useTheme();

    const handleColorChange = (colorKey) => {
        console.log('Changement de couleur vers:', colorKey);
        changeAccentColor(colorKey);
        // Forcer un re-render
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Thème de couleur :</span>
            <div className="flex space-x-2">
                {Object.entries(THEMES).map(([key, value]) => (
                    <button
                        key={key}
                        onClick={() => handleColorChange(key)}
                        className={`w-8 h-8 rounded-full transition-all ${accentColor === key ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: value.primary }}
                        title={value.name}
                    >
                        {accentColor === key && <CheckIcon className="h-4 w-4 text-white mx-auto" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ColorPicker;