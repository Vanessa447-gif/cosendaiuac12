-- Table des brouillons
CREATE TABLE IF NOT EXISTS document_drafts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    document_id INT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    version INT DEFAULT 1,
    last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 48 HOUR)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    INDEX idx_user_expires (user_id, expires_at)
);

-- Table des autosaves serveur
CREATE TABLE IF NOT EXISTS server_autosaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    document_id INT NULL,
    title VARCHAR(255),
    content LONGTEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_doc (user_id, document_id)
);

-- Événement de nettoyage automatique (MySQL)
-- Exécuter après avoir activé l'event scheduler
-- SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_expired_drafts
ON SCHEDULE EVERY 1 HOUR
DO
    DELETE FROM document_drafts WHERE expires_at < NOW();