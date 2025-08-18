#!/usr/bin/env node

import { spawn } from 'child_process';

// Test MCP server directly with arguments
const server = spawn('npx', ['-y', '@buger/big-brain@latest', '--sound', '--dialog'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let responseData = '';

server.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log('Response:', data.toString());
});

server.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
});

// Send MCP request
const mcpRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "ask_big_brain",
        arguments: {
            question: "Please analyze the authentication system in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG and explain how the sound and dialog flags work."
        }
    }
};

server.stdin.write(JSON.stringify(mcpRequest) + '\n');

setTimeout(() => {
    server.kill();
    console.log('Test completed');
}, 5000);