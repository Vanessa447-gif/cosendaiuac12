
CREATE DATABASE IF NOT EXISTS registrariat_sae;
USE registrariat_sae;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'archiviste', 'consultant') DEFAULT 'consultant',
    department VARCHAR(100) DEFAULT 'Registrariat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des catégories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6'
);

-- Table des documents
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    category_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    file_type VARCHAR(100),
    uploaded_by INT,
    views_count INT DEFAULT 0,
    downloads_count INT DEFAULT 0,
    status ENUM('actif', 'archive', 'supprime') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table de l'historique
CREATE TABLE history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action_fr VARCHAR(50) NOT NULL,
    action_en VARCHAR(50) NOT NULL,
    document_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- Insérer les catégories
INSERT INTO categories (name_fr, name_en, color) VALUES
('Dossiers étudiants', 'Student Files', '#3b82f6'),
('Notes et résultats', 'Grades & Results', '#10b981'),
('Correspondances', 'Correspondence', '#f59e0b'),
('Documents administratifs', 'Administrative Documents', '#ef4444'),
('Conventions', 'Agreements', '#8b5cf6');

-- Insérer les utilisateurs (mot de passe en clair pour la démo)
INSERT INTO users (username, password, full_name, email, role) VALUES
('admin', 'admin123', 'Jean Mbarga', 'jean.mbarga@cosendai.edu', 'admin'),
('archiviste', 'archiviste123', 'Marie Ngono', 'marie.ngono@cosendai.edu', 'archiviste'),
('consultant', 'consultant123', 'Pierre Essomba', 'pierre.essomba@cosendai.edu', 'consultant');

-- Insérer des documents exemple
INSERT INTO documents (title_fr, title_en, description_fr, description_en, category_id, file_name, file_path, file_size, file_type, uploaded_by) VALUES
('Règlement intérieur 2024', 'Internal Regulations 2024', 'Document officiel du règlement intérieur', 'Official internal regulations document', 4, 'reglement-2024.pdf', '/uploads/reglement-2024.pdf', 2400000, 'pdf', 1),
('Liste des étudiants L1', 'Student List L1', 'Liste des étudiants de Licence 1', 'List of Bachelor 1 students', 1, 'etudiants-l1-2024.xlsx', '/uploads/etudiants-l1-2024.xlsx', 1800000, 'xlsx', 2),
('Résultats examen S1', 'Exam Results S1', 'Résultats du premier semestre', 'First semester results', 2, 'resultats-s1-2024.pdf', '/uploads/resultats-s1-2024.pdf', 3200000, 'pdf', 2);

-- Insérer des activités exemple
INSERT INTO history (user_id, action_fr, action_en, document_id) VALUES
(1, 'connexion', 'login', NULL),
(2, 'upload', 'upload', 2),
(3, 'consultation', 'view', 1);