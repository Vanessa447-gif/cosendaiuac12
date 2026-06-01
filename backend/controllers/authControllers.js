const db = require('../config/database');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password, service_id } = req.body;

        console.log('🔐 Login:', { username, service_id });

        let query = `
            SELECT u.*, s.name_fr as service_name_fr, s.name_en as service_name_en,
                   s.color as service_color, s.icon as service_icon
            FROM users u
            LEFT JOIN services s ON u.service_id = s.id
            WHERE u.username = ? AND u.is_active = 1
        `;
        let params = [username];

        // Si un service est spécifié, filtrer
        if (service_id) {
            query += ' AND u.service_id = ?';
            params.push(service_id);
        }

        const [users] = await db.execute(query, params);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }

        const user = users[0];

        if (password !== user.password) {
            return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
        }

        await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                service_id: user.service_id,
                can_access_all_services: user.can_access_all_services || false
            },
            process.env.JWT_SECRET || 'secret_key_2024',
            { expiresIn: '24h' }
        );

        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en, service_id) VALUES (?, ?, ?, ?)',
            [user.id, 'connexion', 'login', user.service_id]
        );

        delete user.password;

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                service_id: user.service_id,
                service_name_fr: user.service_name_fr,
                service_name_en: user.service_name_en,
                can_access_all_services: user.can_access_all_services
            },
            service: user.service_id ? {
                id: user.service_id,
                name_fr: user.service_name_fr,
                name_en: user.service_name_en,
                color: user.service_color,
                icon: user.service_icon
            } : null
        });

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

module.exports = { login };