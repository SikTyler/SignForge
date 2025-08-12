#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔍 SignForge Development Environment Check\n');

// Check Node version
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  console.log(`✅ Node.js ${nodeVersion} (${majorVersion >= 18 ? 'OK' : 'NEEDS UPDATE'})`);
  if (majorVersion < 18) {
    console.log('   ⚠️  Node.js 18+ is required');
  }
} catch (error) {
  console.log('❌ Could not check Node.js version');
}

// Check folder structure
const requiredFolders = [
  'client',
  'server',
  'server/src',
  'server/uploads',
  'server/uploads/drawings',
  'server/uploads/logos',
  'server/db'
];

console.log('\n📁 Folder Structure:');
for (const folder of requiredFolders) {
  const exists = existsSync(join(rootDir, folder));
  console.log(`${exists ? '✅' : '❌'} ${folder} ${exists ? '' : '(MISSING)'}`);
}

// Check key files
const requiredFiles = [
  'package.json',
  'client/package.json',
  'server/package.json',
  'client/vite.config.ts',
  'server/tsconfig.json',
  'server/src/index.ts',
  'server/src/db.ts'
];

console.log('\n📄 Key Files:');
for (const file of requiredFiles) {
  const exists = existsSync(join(rootDir, file));
  console.log(`${exists ? '✅' : '❌'} ${file} ${exists ? '' : '(MISSING)'}`);
}

// Check server .env
const envPath = join(rootDir, 'server', '.env');
const envExists = existsSync(envPath);
console.log(`\n🔧 Environment: ${envExists ? '✅' : '❌'} server/.env ${envExists ? '' : '(MISSING)'}`);

if (envExists) {
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const hasPort = envContent.includes('PORT=');
    const hasDbPath = envContent.includes('DB_PATH=');
    console.log(`   ${hasPort ? '✅' : '❌'} PORT setting`);
    console.log(`   ${hasDbPath ? '✅' : '❌'} DB_PATH setting`);
  } catch (error) {
    console.log('   ❌ Could not read .env file');
  }
}

// Check if server is running
console.log('\n🌐 Server Health Check:');
try {
  const response = await fetch('http://localhost:3001/api/health');
  if (response.ok) {
    const data = await response.json();
    console.log(`✅ Server running on http://localhost:3001 (${data.ok ? 'healthy' : 'unhealthy'})`);
  } else {
    console.log('❌ Server not responding properly');
  }
} catch (error) {
  console.log('❌ Server not running on http://localhost:3001');
  console.log('   💡 Run "npm run dev" to start the server');
}

// Check npm scripts
console.log('\n📦 NPM Scripts:');
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const requiredScripts = ['dev', 'dev:server', 'dev:client', 'setup', 'doctor'];
  
  for (const script of requiredScripts) {
    const exists = packageJson.scripts && packageJson.scripts[script];
    console.log(`${exists ? '✅' : '❌'} npm run ${script} ${exists ? '' : '(MISSING)'}`);
  }
} catch (error) {
  console.log('❌ Could not read package.json');
}

console.log('\n🎯 Next Steps:');
console.log('1. If any ❌ items above, fix them first');
console.log('2. Run: npm run setup (first time only)');
console.log('3. Run: npm run dev');
console.log('4. Open the Vite URL shown in the console');
console.log('5. Test: http://localhost:3001/api/health');
