#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';

// Test Big Brain MCP in loop mode for multi-agent systems
console.log('Testing Big Brain MCP in loop mode...');

// Test the built version with --loop argument
const serverPath = './build/index.js';

if (!fs.existsSync(serverPath)) {
    console.error('Build not found. Run npm run build first.');
    process.exit(1);
}

console.log('Starting MCP server in loop mode...');

// Start server with --loop argument and custom prompt
const server = spawn('node', [serverPath, '--loop', 'Now call research-agent to investigate this issue'], {
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
    
    // Check for loop mode specific content
    const loopModeChecks = [
        {
            check: output.includes('MULTI-AGENT MODE'),
            message: 'Tool description indicates multi-agent mode'
        },
        {
            check: output.includes('Now call research-agent to investigate this issue'),
            message: 'Custom loop prompt is included in response'
        },
        {
            check: output.includes('Pass to the agent instruction to read the question from this file:'),
            message: 'File reading instruction for agent is present'
        },
        {
            check: !output.includes('REQUIRES USER INTERACTION'),
            message: 'User interaction warning is not present (correct for loop mode)'
        },
        {
            check: !output.includes('copy the content from the dialog'),
            message: 'Clipboard instructions are not present (correct for loop mode)'
        }
    ];
    
    console.log('\n--- Loop Mode Test Results ---');
    let allPassed = true;
    
    loopModeChecks.forEach(({ check, message }) => {
        if (check) {
            console.log(`✅ ${message}`);
        } else {
            console.log(`❌ ${message}`);
            allPassed = false;
        }
    });
    
    if (allPassed) {
        console.log('\n🎉 ALL LOOP MODE TESTS PASSED!');
    } else {
        console.log('\n❌ Some loop mode tests failed');
    }
    
    process.exit(allPassed ? 0 : 1);
}, 5000);