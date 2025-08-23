#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Big Brain with DEFAULT settings (no flags)...');

// Test the built version with NO flags - should enable sound and notify by default
const server = spawn('node', ['./build/index.js'], {
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

// Send ask_big_brain request
setTimeout(() => {
    console.log('\n--- Testing default behavior (should have sound + notification) ---');
    const toolRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "ask_big_brain",
            arguments: {
                question: "Please analyze /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG"
            }
        }
    };
    
    server.stdin.write(JSON.stringify(toolRequest) + '\n');
}, 1000);

// Kill after timeout
setTimeout(() => {
    server.kill();
    console.log('\n--- Test completed ---');
    
    // Check behavior - should show "Copy the content from the dialog" (notification enabled)
    if (output.includes('Copy the content from the dialog')) {
        console.log('✅ SUCCESS: Default notification enabled - shows dialog instruction');
    } else if (output.includes('Paste the clipboard content')) {
        console.log('❌ FAILED: Notification not enabled by default');
    }
    
    process.exit(0);
}, 5000);