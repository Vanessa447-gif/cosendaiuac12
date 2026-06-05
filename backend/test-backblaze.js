require('dotenv').config();
const storage = require('./config/storage');

async function testBackblaze() {
    console.log('🧪 Test de connexion Backblaze B2...\n');
    
    // 1. Test upload
    console.log('1️⃣ Test upload...');
    const testContent = `Test Backblaze B2 - ${new Date().toISOString()}`;
    const testBuffer = Buffer.from(testContent);
    const testFileName = `test/test-${Date.now()}.txt`;
    
    const upload = await storage.uploadFile(testFileName, testBuffer, 'text/plain');
    if (!upload.success) {
        console.log('❌ Échec upload:', upload.error);
        return;
    }
    console.log('✅ Upload réussi');
    
    // 2. Test URL
    console.log('\n2️⃣ Génération URL...');
    const url = storage.getFileUrl(testFileName);
    console.log(`✅ URL: ${url}`);
    
    // 3. Test lecture
    console.log('\n3️⃣ Test lecture...');
    const fileContent = await storage.readFile(testFileName);
    if (fileContent) {
        console.log(`✅ Contenu lu: ${fileContent.toString()}`);
    } else {
        console.log('⚠️ Lecture non supportée');
    }
    
    // 4. Test suppression
    console.log('\n4️⃣ Nettoyage...');
    const deleted = await storage.deleteFile(testFileName);
    if (deleted) {
        console.log('✅ Fichier supprimé');
    }
    
    console.log('\n🎉 Configuration Backblaze B2 réussie !');
}

testBackblaze().catch(console.error);