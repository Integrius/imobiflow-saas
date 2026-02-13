/**
 * Gera hash bcrypt para senha admin123
 * Executar: node scripts/generate-admin-hash.js
 */

const bcrypt = require('bcryptjs');

async function generateHash() {
  const senha = 'admin123';
  const hash = await bcrypt.hash(senha, 10);

  console.log('='.repeat(60));
  console.log('🔐 Hash Bcrypt para senha "admin123"');
  console.log('='.repeat(60));
  console.log('');
  console.log('Senha:', senha);
  console.log('Hash:', hash);
  console.log('');
  console.log('Use este hash no SQL INSERT para criar o usuário admin');
  console.log('='.repeat(60));
}

generateHash().catch(console.error);
