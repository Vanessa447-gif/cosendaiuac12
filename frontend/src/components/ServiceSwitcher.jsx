import React, { useState, useRef, useEffect } from 'react';
import { useService } from '../contexts/ServiceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const ServiceSwitcher = () => {
    const { services, currentService, switchService } = useService();
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentService || services.length <= 1) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
            >
                <span className="text-2xl">{currentService.icon}</span>
                <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {language === 'fr' ? currentService.name_fr : currentService.name_en}
                    </p>
                    <p className="text-xs text-gray-500">{currentService.code}</p>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 px-3 py-1">Changer de service</p>
                    </div>
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => {
                                switchService(service);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                currentService.id === service.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                            }`}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${service.color}20` }}>
                                {service.icon}
                            </div>
                            <div className="flex-1 text-left">
                                <p className={`font-medium ${currentService.id === service.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                                    {language === 'fr' ? service.name_fr : service.name_en}
                                </p>
                                <p className="text-xs text-gray-500">{service.description_fr?.substring(0, 50)}</p>
                            </div>
                            {currentService.id === service.id && (
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceSwitcher;