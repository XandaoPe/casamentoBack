// scripts/generate-hash.ts
import * as bcrypt from 'bcryptjs';

async function generateHash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Senha:', password);
    console.log('Hash:', hash);
}

generateHash();