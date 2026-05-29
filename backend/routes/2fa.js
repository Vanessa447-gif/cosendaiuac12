const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Générer le secret 2FA
app.post('/api/2fa/generate', (req, res) => {
    const secret = speakeasy.generateSecret({
        name: `Registrariat SAE (${req.user.email})`
    });
    
    QRCode.toDataURL(secret.otpauth_url, (err, qrCode) => {
        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCode
        });
    });
});

// Vérifier le code 2FA
app.post('/api/2fa/verify', (req, res) => {
    const { secret, token } = req.body;
    
    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token
    });
    
    res.json({ success: verified });
});