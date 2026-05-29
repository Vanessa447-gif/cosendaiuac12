import React from 'react';
import { motion } from 'framer-motion';

const BADGES = [
    { id: 'first_doc', name: 'Premier document', icon: '🎯', condition: (user) => user.documentsUploaded >= 1 },
    { id: 'power_user', name: 'Power User', icon: '⚡', condition: (user) => user.documentsUploaded >= 50 },
    { id: 'expert', name: 'Expert en archivage', icon: '🏆', condition: (user) => user.documentsUploaded >= 100 },
    { id: 'popular', name: 'Populaire', icon: '🔥', condition: (user) => user.totalViews >= 1000 },
    { id: 'helper', name: 'Contributeur', icon: '🤝', condition: (user) => user.uploadsCount >= 20 },
];

const BadgeSystem = ({ user }) => {
    const earnedBadges = BADGES.filter(badge => badge.condition(user));
    const progress = (earnedBadges.length / BADGES.length) * 100;

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6">
            <h3 className="font-semibold mb-4">🏆 Badges débloqués ({earnedBadges.length}/{BADGES.length})</h3>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <motion.div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1 }}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                {BADGES.map(badge => {
                    const earned = earnedBadges.includes(badge);
                    return (
                        <motion.div
                            key={badge.id}
                            whileHover={{ scale: 1.05 }}
                            className={`p-3 rounded-lg text-center transition-all ${earned ? 'bg-white shadow-md' : 'opacity-40 grayscale'}`}
                        >
                            <div className="text-3xl">{badge.icon}</div>
                            <p className="text-xs mt-1">{badge.name}</p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};