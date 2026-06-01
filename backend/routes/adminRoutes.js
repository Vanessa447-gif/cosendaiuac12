const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// Vérifier que l'utilisateur est admin
router.use(async (req, res, next) => {
    try {
        const [users] = await db.execute('SELECT role FROM users WHERE id = ?', [req.userId]);
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.id, u.username, u.full_name, u.email, u.role, u.service_id, u.department, u.is_active, u.created_at,
                   s.name_fr as service_name
            FROM users u
            LEFT JOIN services s ON u.service_id = s.id
            ORDER BY u.created_at DESC
        `);
        
        // Ne pas renvoyer les mots de passe
        const safeUsers = users.map(u => {
            delete u.password;
            return u;
        });
        
        res.json({ success: true, users: safeUsers });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', users: [] });
    }
});

// Créer un utilisateur
router.post('/users', async (req, res) => {
    try {
        const { username, password, full_name, email, role, service_id, department } = req.body;
        
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Nom d\'utilisateur ou email déjà utilisé' });
        }
        
        await db.execute(
            `INSERT INTO users (username, password, full_name, email, role, service_id, department, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [username, password, full_name, email, role, service_id, department]
        );
        
        res.json({ success: true, message: 'Utilisateur créé' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, service_id, department, is_active } = req.body;
        
        await db.execute(
            `UPDATE users SET full_name = ?, email = ?, role = ?, service_id = ?, department = ?, is_active = ?
             WHERE id = ?`,
            [full_name, email, role, service_id, department, is_active, id]
        );
        
        res.json({ success: true, message: 'Utilisateur modifié' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (parseInt(id) === parseInt(req.userId)) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
        }
        
        await db.execute('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

// Réinitialiser le mot de passe
router.put('/users/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;
        
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [new_password, id]);
        res.json({ success: true, message: 'Mot de passe réinitialisé' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
});

module.exports = router;