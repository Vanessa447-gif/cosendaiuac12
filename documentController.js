const db = require('../config/database');

const getDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';
        const offset = page * size;

        let query = `
            SELECT d.*, c.name_fr as category_name_fr, c.name_en as category_name_en,
                   c.color as category_color, u.full_name as uploader_name
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.status = 'actif'
        `;

        let countQuery = `SELECT COUNT(*) as total FROM documents WHERE status = 'actif'`;
        let params = [];
        let countParams = [];

        if (search) {
            query += ` AND (d.title_fr LIKE ? OR d.title_en LIKE ? OR d.description_fr LIKE ? OR d.description_en LIKE ?)`;
            countQuery += ` AND (title_fr LIKE ? OR title_en LIKE ? OR description_fr LIKE ? OR description_en LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
            countParams.push(searchParam, searchParam, searchParam, searchParam);
        }

        query += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
        params.push(size.toString(), offset.toString());

        const [countResult] = await db.execute(countQuery, countParams);
        const total = countResult[0].total;

        const [documents] = await db.execute(query, params);

        res.json({
            success: true,
            documents,
            total,
            page,
            totalPages: Math.ceil(total / size)
        });

    } catch (error) {
        console.error('Erreur getDocuments:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const createDocument = async (req, res) => {
    try {
        const {
            title_fr, title_en, description_fr, description_en,
            categoryId, fileName, filePath, fileSize, fileType, uploadedBy
        } = req.body;

        const [result] = await db.execute(`
            INSERT INTO documents 
            (title_fr, title_en, description_fr, description_en, category_id, 
             file_name, file_path, file_size, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title_fr, title_en, description_fr, description_en, categoryId,
            fileName, filePath, fileSize, fileType, uploadedBy]);

        const documentId = result.insertId;

        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id) VALUES (?, ?, ?, ?)',
            [uploadedBy, 'upload', 'upload', documentId]
        );

        res.json({
            success: true,
            message: 'Document ajouté avec succès',
            id: documentId
        });

    } catch (error) {
        console.error('Erreur createDocument:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        await db.execute(
            'UPDATE documents SET status = ? WHERE id = ?',
            ['supprime', id]
        );

        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, document_id) VALUES (?, ?, ?, ?)',
            [userId, 'suppression', 'delete', id]
        );

        res.json({
            success: true,
            message: 'Document supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur deleteDocument:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = {
    getDocuments,
    createDocument,
    deleteDocument
};