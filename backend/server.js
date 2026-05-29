const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// ========== CORS COMPLET (LA SOLUTION ULTIME) ==========
app.use((req, res, next) => {
    // Permettre à toutes les origines
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, userid');
    res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
    
    // Répondre immédiatement aux requêtes OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== MYSQL ==========
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'registrariat_sae'
});

db.connect(err => {
    if (err) console.error('❌ MySQL Error:', err);
    else console.log('✅ MySQL Connected');
});

// ========== UPLOAD ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ========== FONCTION AUDIT ==========
function addAudit(userId, actionFr, actionEn, documentId = null, details = null) {
    const sql = 'INSERT INTO history (user_id, action_fr, action_en, document_id, details) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, actionFr, actionEn, documentId, details], (err) => {
        if (err) console.error('❌ Audit error:', err);
    });
}

// ========== ROUTES ==========

// TEST
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API OK' });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err || results.length === 0) {
            return res.json({ success: false, message: 'Utilisateur non trouvé' });
        }
        
        const user = results[0];
        
        if (password === user.password) {
            const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '24h' });
            delete user.password;
            
            addAudit(user.id, 'connexion', 'login');
            
            res.json({ success: true, token, user });
        } else {
            res.json({ success: false, message: 'Mot de passe incorrect' });
        }
    });
});

// GET DOCUMENT
app.get('/api/documents/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.headers.userid || 1;
    
    db.query('UPDATE documents SET views_count = views_count + 1 WHERE id = ?', [id]);
    
    db.query(`SELECT d.*, c.name_fr as category_name_fr, u.full_name as uploader_name 
              FROM documents d LEFT JOIN categories c ON d.category_id = c.id 
              LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = ?`, [id], (err, results) => {
        if (err || results.length === 0) return res.json({ success: false });
        
        addAudit(userId, 'consultation', 'view', id);
        
        res.json({ success: true, document: results[0] });
    });
});

// UPLOAD FILE
app.post('/api/documents/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.json({ success: false });
    res.json({ success: true, fileName: req.file.filename, filePath: `/uploads/${req.file.filename}`, fileSize: req.file.size });
});

// CREATE DOCUMENT
app.post('/api/documents', (req, res) => {
    const { title_fr, title_en, categoryId, fileName, filePath, fileSize, uploadedBy } = req.body;
    
    db.query(
        `INSERT INTO documents (title_fr, title_en, category_id, file_name, file_path, file_size, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title_fr, title_en, categoryId, fileName, filePath, fileSize, uploadedBy],
        (err, result) => {
            if (err) return res.json({ success: false });
            
            addAudit(uploadedBy, 'upload', 'upload', result.insertId);
            
            res.json({ success: true, id: result.insertId });
        }
    );
});

// GET ALL DOCUMENTS
app.get('/api/documents', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const search = req.query.search || '';
    const offset = page * size;
    
    let sql = `SELECT d.*, c.name_fr as category_name_fr, c.color as category_color, u.full_name as uploader_name
               FROM documents d LEFT JOIN categories c ON d.category_id = c.id 
               LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.status = 'actif'`;
    
    if (search) sql += ` AND (d.title_fr LIKE '%${search}%' OR d.title_en LIKE '%${search}%')`;
    sql += ` ORDER BY d.created_at DESC LIMIT ${size} OFFSET ${offset}`;
    
    db.query(sql, (err, documents) => {
        if (err) return res.json({ success: false, documents: [] });
        db.query('SELECT COUNT(*) as total FROM documents WHERE status = "actif"', (err, countResult) => {
            res.json({ success: true, documents, total: countResult[0].total, page, totalPages: Math.ceil(countResult[0].total / size) });
        });
    });
});

// UPDATE DOCUMENT
app.put('/api/documents/:id', (req, res) => {
    const id = req.params.id;
    const { title_fr, title_en, description_fr, description_en, category_id } = req.body;
    const userId = req.headers.userid || 1;
    
    db.query(`UPDATE documents SET title_fr=?, title_en=?, description_fr=?, description_en=?, category_id=? WHERE id=?`,
        [title_fr, title_en, description_fr, description_en, category_id, id],
        (err) => {
            if (err) return res.json({ success: false });
            
            addAudit(userId, 'modification', 'update', id);
            
            res.json({ success: true });
        }
    );
});

// DELETE DOCUMENT
app.delete('/api/documents/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.headers.userid || 1;
    
    db.query('SELECT file_name FROM documents WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.json({ success: false });
        const filePath = path.join(__dirname, 'uploads', results[0].file_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        db.query('DELETE FROM documents WHERE id = ?', [id], (err) => {
            if (err) return res.json({ success: false });
            
            addAudit(userId, 'suppression', 'delete', id);
            
            res.json({ success: true });
        });
    });
});

// DOWNLOAD INCREMENT
app.post('/api/documents/:id/download', (req, res) => {
    const id = req.params.id;
    const userId = req.headers.userid || 1;
    
    db.query('UPDATE documents SET downloads_count = downloads_count + 1 WHERE id = ?', [id], (err) => {
        if (err) return res.json({ success: false });
        
        addAudit(userId, 'téléchargement', 'download', id);
        
        res.json({ success: true });
    });
});

// ========== ROUTES ADMIN USERS ==========
app.get('/api/admin/users', (req, res) => {
    db.query('SELECT id, username, full_name, email, role, department, is_active, created_at FROM users ORDER BY created_at DESC', (err, users) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, users });
    });
});

app.post('/api/admin/users', (req, res) => {
    const { username, password, full_name, email, role, department } = req.body;
    
    db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) {
            return res.json({ success: false, message: 'Nom d\'utilisateur ou email déjà utilisé' });
        }
        
        db.query('INSERT INTO users (username, password, full_name, email, role, department, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [username, password, full_name, email, role, department],
            (err, result) => {
                if (err) return res.status(500).json({ success: false });
                res.json({ success: true, message: 'Utilisateur créé', id: result.insertId });
            });
    });
});

app.put('/api/admin/users/:id', (req, res) => {
    const id = req.params.id;
    const { full_name, email, role, department, is_active } = req.body;
    
    db.query('UPDATE users SET full_name=?, email=?, role=?, department=?, is_active=? WHERE id=?',
        [full_name, email, role, department, is_active, id],
        (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Utilisateur modifié' });
        });
});

app.delete('/api/admin/users/:id', (req, res) => {
    const id = req.params.id;
    const adminId = parseInt(req.headers.userid || 1);
    
    if (id == adminId) {
        return res.json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Utilisateur supprimé' });
    });
});

app.put('/api/admin/users/:id/reset-password', (req, res) => {
    const id = req.params.id;
    const { new_password } = req.body;
    
    db.query('UPDATE users SET password = ? WHERE id = ?', [new_password, id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Mot de passe réinitialisé' });
    });
});

// ========== ROUTE AUDIT ==========
app.get('/api/audit', (req, res) => {
    const sql = `
        SELECT h.*, u.full_name as user_name, d.title_fr as document_name
        FROM history h
        LEFT JOIN users u ON h.user_id = u.id
        LEFT JOIN documents d ON h.document_id = d.id
        ORDER BY h.created_at DESC
        LIMIT 100
    `;
    
    db.query(sql, (err, logs) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, logs });
    });
});

// ========== AUTRES ROUTES ==========
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
        res.json({ success: true, categories: results });
    });
});

app.get('/api/stats', (req, res) => {
    db.query('SELECT COUNT(*) as total FROM documents', (err, total) => {
        db.query('SELECT SUM(views_count) as views FROM documents', (err, views) => {
            db.query('SELECT COUNT(*) as users FROM users', (err, users) => {
                res.json({ success: true, stats: { totalDocuments: total[0].total, totalViews: views[0]?.views || 0, activeUsers: users[0].users } });
            });
        });
    });
});

app.get('/api/users', (req, res) => {
    db.query('SELECT id, username, full_name, email, role FROM users', (err, users) => {
        res.json({ success: true, data: users });
    });
});

app.use('/uploads', express.static('uploads'));

// ========== START ==========
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log('✅ CORS activé pour toutes les origines');
    console.log('✅ Routes disponibles: /api/auth/login, /api/documents, /api/admin/users, /api/audit\n');
});