#!/usr/bin/env node

import { spawn } from 'child_process';

// Test MCP server with --chatgpt mode
console.log('🧪 Testing BigBrain with ChatGPT mode');
console.log('=====================================\n');

const server = spawn('node', ['build/index.js', '--chatgpt'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let responseData = '';

server.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log('Response:', data.toString());
});

server.stderr.on('data', (data) => {
    console.error('Stderr:', data.toString());
});

// Send MCP request
const mcpRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "ask_big_brain",
        arguments: {
            question: "What is the simplest way to reverse a string in JavaScript? Show me a quick example in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/test_simple.js"
        }
    }
};

console.log('📤 Sending MCP request...');
console.log('Question:', mcpRequest.params.arguments.question);
console.log('\n⏳ Waiting for ChatGPT response (this may take 30-60 seconds)...\n');

server.stdin.write(JSON.stringify(mcpRequest) + '\n');

// Wait longer for ChatGPT response
setTimeout(() => {
    server.kill();
    console.log('\n✅ Test completed');
    
    // Parse and display the response
    try {
        const lines = responseData.split('\n').filter(line => line.trim());
        for (const line of lines) {
            try {
                const json = JSON.parse(line);
                if (json.result && json.result.content) {
                    console.log('\n📝 ChatGPT Response:');
                    console.log('==================');
                    console.log(json.result.content[0].text);
                }
            } catch {}
        }
    } catch (e) {
        console.log('Could not parse response:', e.message);
    }
}, 70000); // 70 seconds timeout