import fs from 'fs';
import path from 'path';

// Create the wrapper script
const wrapperScript = `#!/usr/bin/env node

// Wrapper for @buger/big-brain -> @probelabs/big-brain migration
// This ensures existing users don't break while encouraging migration

console.warn('⚠️  DEPRECATED: @buger/big-brain has moved to @probelabs/big-brain');
console.warn('📦 Please update your package.json: npm install @probelabs/big-brain');
console.warn('🔗 More info: https://github.com/probelabs/big-brain\\n');

// Forward all arguments and functionality to the new package
try {
  const { spawn } = await import('child_process');
  const path = await import('path');
  
  // Find the new package's executable
  const newPackagePath = path.dirname(require.resolve('@probelabs/big-brain/package.json'));
  const newExecutable = path.join(newPackagePath, 'build', 'index.js');
  
  // Forward all arguments
  const child = spawn('node', [newExecutable, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: false
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  child.on('error', (err) => {
    console.error('Failed to execute @probelabs/big-brain:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('Error loading @probelabs/big-brain:', error);
  console.error('Please install the new package: npm install @probelabs/big-brain');
  process.exit(1);
}
`;

// Write the wrapper script
fs.writeFileSync('build/index.js', wrapperScript);

// Make it executable
fs.chmodSync('build/index.js', '755');

console.log('✅ Wrapper script created successfully');