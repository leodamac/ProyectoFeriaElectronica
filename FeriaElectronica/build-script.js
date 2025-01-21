const { execSync } = require('child_process');

try {
  // Instalar Angular CLI globalmente
  execSync('npm install -g @angular/cli', { stdio: 'inherit' });
  
  // Ejecutar el build
  execSync('ng build --configuration production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--max_old_space_size=4096' }
  });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}