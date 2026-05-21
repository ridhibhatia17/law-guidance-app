const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(backendDir, '..', 'frontend');
const frontendBuildDir = path.join(frontendDir, 'build');
const backendPublicDir = path.join(backendDir, 'public');

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit' });
}

if (!fs.existsSync(frontendDir)) {
  throw new Error(`Frontend directory not found at ${frontendDir}`);
}

run('npm install', frontendDir);
run('npm run build', frontendDir);

fs.rmSync(backendPublicDir, { recursive: true, force: true });
fs.cpSync(frontendBuildDir, backendPublicDir, { recursive: true });

console.log(`Frontend build copied to ${backendPublicDir}`);