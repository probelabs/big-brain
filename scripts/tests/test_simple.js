#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';

// Simple test to verify our MCP changes work
console.log('Testing Big Brain MCP with our changes...');

// Test the built version
const serverPath = './build/index.js';

if (!fs.existsSync(serverPath)) {
    console.error('Build not found. Run npm run build first.');
    process.exit(1);
}

console.log('Starting MCP server...');

const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    console.log('Server output:', data.toString().trim());
});

server.stderr.on('data', (data) => {
    console.log('Server error:', data.toString().trim());
});

// Send list tools request first
setTimeout(() => {
    console.log('\n--- Sending list tools request ---');
    const listRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {}
    };
    
    server.stdin.write(JSON.stringify(listRequest) + '\n');
}, 500);

// Then test ask_big_brain
setTimeout(() => {
    console.log('\n--- Sending ask_big_brain request ---');
    const toolRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
            name: "ask_big_brain",
            arguments: {
                question: "Please analyze the temp file handling in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG and explain how it works."
            }
        }
    };
    
    server.stdin.write(JSON.stringify(toolRequest) + '\n');
}, 1500);

// Kill after timeout
setTimeout(() => {
    server.kill();
    console.log('\n--- Test completed ---');
    
    // Check if our expected text appears in output
    if (output.includes('Question also saved to file, if clipboard failed:')) {
        console.log('✅ SUCCESS: Found expected temp file message in output');
    } else {
        console.log('❌ FAILED: Expected temp file message not found');
    }
    
    process.exit(0);
}, 5000);