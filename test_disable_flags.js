#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Big Brain with --disable-sound --disable-notification flags...');

// Test with disable flags
const server = spawn('node', ['./build/index.js', '--disable-sound', '--disable-notification'], {
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
    console.log('\n--- Testing with disable flags (should be silent) ---');
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
    
    // Check behavior - should show "Paste the clipboard content" (notification disabled)
    if (output.includes('Paste the clipboard content')) {
        console.log('✅ SUCCESS: Disable flags working - shows clipboard instruction');
    } else if (output.includes('Copy the content from the dialog')) {
        console.log('❌ FAILED: Disable flags not working - still shows dialog instruction');
    }
    
    process.exit(0);
}, 5000);