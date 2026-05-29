import React from 'react';

const HighlightedText = ({ text, highlight }) => {
    if (!highlight || !text) return <span>{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? 
                    <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white px-0.5 rounded">{part}</mark> : 
                    <span key={i}>{part}</span>
            )}
        </span>
    );
};

export default HighlightedText;