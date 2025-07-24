// Simple script to start both server and client for Windows users
const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '3001'; // Set server port to 3001

// Start the server
console.log('Starting server on port 3001...');
const server = spawn('node', ['--loader', 'tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development', PORT: '3001' }
});

// Start the client
console.log('Starting client on port 3000...');
const client = spawn('npx', ['vite', '--port', '3000'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client')
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill();
  client.kill();
  process.exit();
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  client.kill();
  process.exit(code);
});

client.on('close', (code) => {
  console.log(`Client process exited with code ${code}`);
  server.kill();
  process.exit(code);
});