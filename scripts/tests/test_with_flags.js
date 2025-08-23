#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('Testing Big Brain with --sound and --notify flags...');

// Test the built version with flags
const server = spawn('node', ['./build/index.js', '--sound', '--notify'], {
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
    console.log('\n--- Sending ask_big_brain request with flags ---');
    const toolRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "ask_big_brain",
            arguments: {
                question: "Please analyze the notification system in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#showNotificationAndCopy and explain how sound and notify flags work."
            }
        }
    };
    
    server.stdin.write(JSON.stringify(toolRequest) + '\n');
}, 1000);

// Kill after timeout
setTimeout(() => {
    server.kill();
    console.log('\n--- Test completed ---');
    
    // Check for our expected message
    if (output.includes('Question also saved to file, if clipboard failed:')) {
        console.log('✅ SUCCESS: Found temp file message');
        
        // Check that it should show "Copy the content from the dialog"
        if (output.includes('Copy the content from the dialog')) {
            console.log('✅ SUCCESS: Notify flag working - shows dialog instruction');
        } else if (output.includes('Paste the clipboard content')) {
            console.log('ℹ️  INFO: Shows clipboard instruction (notify flag may not be working)');
        }
    } else {
        console.log('❌ FAILED: Expected temp file message not found');
    }
    
    process.exit(0);
}, 5000);