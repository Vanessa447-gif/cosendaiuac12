const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// Récupérer les documents du service connecté
const getDocuments = async (req, res) => {
    try {
        const serviceId = req.userServiceId;
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const offset = page * size;
        
        let sql = `
            SELECT d.*, 
                   c.name_fr as category_name_fr, 
                   c.name_en as category_name_en,
                   c.color as category_color, 
                   u.full_name as uploader_name
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.status = 'actif' AND d.service_id = ?
        `;
        let params = [serviceId];
        
        if (search) {
            sql += ` AND (d.title_fr LIKE ? OR d.title_en LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        sql += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
        params.push(size, offset);
        
        const [documents] = await db.execute(sql, params);
        
        const [countResult] = await db.execute(
            'SELECT COUNT(*) as total FROM documents WHERE service_id = ? AND status = "actif"',
            [serviceId]
        );
        
        res.json({
            success: true,
            documents,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / size)
        });
    } catch (error) {
        console.error('Erreur getDocuments:', error);
        res.status(500).json({ success: false, documents: [], total: 0 });
    }
};

// Récupérer un document par ID avec incrémentation des vues
const getDocumentById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        
        // Incrémenter les vues
        await db.execute('UPDATE documents SET views_count = views_count + 1 WHERE id = ?', [id]);
        
        const [documents] = await db.execute(`
            SELECT d.*, 
                   c.name_fr as category_name_fr, 
                   c.name_en as category_name_en,
                   c.color as category_color, 
                   u.full_name as uploader_name
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.id = ?
        `, [id]);
        
        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        }
        
        // Audit
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, service_id) VALUES (?, ?, ?, ?, ?)',
            [userId, 'consultation', 'view', id, documents[0].service_id]
        );
        
        res.json({ success: true, document: documents[0] });
    } catch (error) {
        console.error('Erreur getDocumentById:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Créer un document
const createDocument = async (req, res) => {
    try {
        const { title_fr, title_en, description_fr, description_en, categoryId, fileName, filePath, fileSize, fileType } = req.body;
        const serviceId = req.userServiceId;
        const userId = req.userId;
        
        const [result] = await db.execute(
            `INSERT INTO documents 
            (title_fr, title_en, description_fr, description_en, category_id, 
             file_name, file_path, file_size, file_type, uploaded_by, service_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title_fr, title_en, description_fr || '', description_en || '',
             categoryId, fileName, filePath, fileSize, fileType, userId, serviceId]
        );
        
        // Audit
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, service_id) VALUES (?, ?, ?, ?, ?)',
            [userId, 'upload', 'upload', result.insertId, serviceId]
        );
        
        res.json({ success: true, message: 'Document créé avec succès', id: result.insertId });
    } catch (error) {
        console.error('Erreur createDocument:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Supprimer un document
const deleteDocument = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        
        const [docs] = await db.execute('SELECT file_name, service_id FROM documents WHERE id = ?', [id]);
        if (docs.length === 0) {
            return res.status(404).json({ success: false, message: 'Document non trouvé' });
        }
        
        const filePath = path.join(__dirname, '../uploads', docs[0].file_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        await db.execute('DELETE FROM documents WHERE id = ?', [id]);
        
        // Audit
        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id, service_id) VALUES (?, ?, ?, ?, ?)',
            [userId, 'suppression', 'delete', id, docs[0].service_id]
        );
        
        res.json({ success: true, message: 'Document supprimé avec succès' });
    } catch (error) {
        console.error('Erreur deleteDocument:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// Incrémenter les téléchargements
const incrementDownload = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        
        await db.execute('UPDATE documents SET downloads_count = downloads_count + 1 WHERE id = ?', [id]);
        
        const [docs] = await db.execute('SELECT service_id FROM documents WHERE id = ?', [id]);
        if (docs.length > 0) {
            await db.execute(
                'INSERT INTO history (user_id, action_fr, action_en, document_id, service_id) VALUES (?, ?, ?, ?, ?)',
                [userId, 'téléchargement', 'download', id, docs[0].service_id]
            );
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur incrementDownload:', error);
        res.status(500).json({ success: false });
    }
};

module.exports = {
    getDocuments,
    getDocumentById,
    createDocument,
    deleteDocument,
    incrementDownload
};