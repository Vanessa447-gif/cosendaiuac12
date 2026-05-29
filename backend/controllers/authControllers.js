const db = require('../config/database');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Nom d\'utilisateur ou mot de passe incorrect'
            });
        }

        const user = users[0];

        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Nom d\'utilisateur ou mot de passe incorrect'
            });
        }

        await db.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        await db.execute(
            'INSERT INTO history (user_id, action_fr, action_en) VALUES (?, ?, ?)',
            [user.id, 'connexion', 'login']
        );

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;

        res.json({
            success: true,
            token,
            user
        });

    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = { login };