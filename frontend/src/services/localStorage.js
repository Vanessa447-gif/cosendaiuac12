import Dexie from 'dexie';

// Base de données locale IndexedDB
const db = new Dexie('SaeEditorDB');
db.version(1).stores({
    drafts: 'id, userId, documentId, title, content, lastSaved, lastModified',
    autosave: '++id, userId, documentId, content, timestamp'
});

// Sauvegarder un brouillon
export const saveDraft = async (userId, documentId, title, content) => {
    try {
        const draft = {
            id: `${userId}_${documentId || 'new'}`,
            userId,
            documentId: documentId || null,
            title,
            content,
            lastSaved: new Date().toISOString(),
            lastModified: new Date().getTime()
        };
        
        await db.drafts.put(draft);
        console.log('✅ Brouillon sauvegardé localement');
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde locale:', error);
        return false;
    }
};

// Récupérer un brouillon
export const getDraft = async (userId, documentId) => {
    try {
        const id = `${userId}_${documentId || 'new'}`;
        const draft = await db.drafts.get(id);
        return draft;
    } catch (error) {
        console.error('Erreur récupération locale:', error);
        return null;
    }
};

// Récupérer tous les brouillons d'un utilisateur
export const getAllDrafts = async (userId) => {
    try {
        const drafts = await db.drafts.where('userId').equals(userId).toArray();
        return drafts.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
        console.error('Erreur récupération brouillons:', error);
        return [];
    }
};

// Supprimer un brouillon
export const deleteDraft = async (userId, documentId) => {
    try {
        const id = `${userId}_${documentId || 'new'}`;
        await db.drafts.delete(id);
        console.log('✅ Brouillon local supprimé');
        return true;
    } catch (error) {
        console.error('Erreur suppression locale:', error);
        return false;
    }
};

// Sauvegarde automatique (autosave)
export const autoSave = async (userId, documentId, content) => {
    try {
        await db.autosave.add({
            userId,
            documentId: documentId || null,
            content,
            timestamp: new Date().toISOString()
        });
        
        // Garder seulement les 50 derniers autosave
        const count = await db.autosave.where('userId').equals(userId).count();
        if (count > 50) {
            const oldest = await db.autosave.where('userId').equals(userId).reverse().offset(50).first();
            if (oldest) await db.autosave.delete(oldest.id);
        }
        
        console.log('✅ Autosave local effectué');
    } catch (error) {
        console.error('Erreur autosave:', error);
    }
};

// Récupérer les autosaves
export const getAutosaves = async (userId, documentId) => {
    try {
        const saves = await db.autosave
            .where('userId')
            .equals(userId)
            .and(item => item.documentId === documentId || (!item.documentId && !documentId))
            .reverse()
            .limit(20)
            .toArray();
        return saves;
    } catch (error) {
        console.error('Erreur récupération autosaves:', error);
        return [];
    }
};

// Nettoyer les anciens brouillons (plus de 48h)
export const cleanupOldDrafts = async () => {
    try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
        
        const allDrafts = await db.drafts.toArray();
        const oldDrafts = allDrafts.filter(d => new Date(d.lastSaved) < twoDaysAgo);
        
        for (const draft of oldDrafts) {
            await db.drafts.delete(draft.id);
        }
        
        console.log(`🧹 ${oldDrafts.length} anciens brouillons supprimés`);
    } catch (error) {
        console.error('Erreur nettoyage:', error);
    }
};