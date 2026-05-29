import React from 'react';
import { Timeline } from 'antd';
import { UserIcon, DocumentIcon, UploadIcon, DownloadIcon } from '@heroicons/react/24/outline';

const AuditVisualization = ({ events }) => {
    const getIcon = (action) => {
        switch(action) {
            case 'upload': return <UploadIcon className="h-4 w-4 text-green-500" />;
            case 'download': return <DownloadIcon className="h-4 w-4 text-blue-500" />;
            default: return <UserIcon className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">📋 Chronologie des activités</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {events?.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="mt-1">{getIcon(event.action)}</div>
                        <div className="flex-1">
                            <p className="text-sm">
                                <span className="font-medium">{event.user_name}</span> a {event.action_fr}
                                {event.document_name && <span> le document <span className="font-medium">"{event.document_name}"</span></span>}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
