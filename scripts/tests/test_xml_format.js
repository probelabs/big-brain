#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Test the new XML format output
console.log('Testing Big Brain XML format output...');

// Test the built version
const serverPath = './build/index.js';

if (!fs.existsSync(serverPath)) {
    console.error('Build not found. Run npm run build first.');
    process.exit(1);
}

console.log('Starting MCP server with --disable-notification --disable-sound...');

const server = spawn('node', [serverPath, '--disable-notification', '--disable-sound'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
    output += data.toString();
    // Only log non-empty, meaningful output
    const str = data.toString().trim();
    if (str && !str.includes('jsonrpc')) {
        console.log('Server output:', str.substring(0, 200));
    }
});

server.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.log('Server error:', data.toString().trim());
});

// Send test request with both file and symbol references
setTimeout(() => {
    console.log('\n--- Sending ask_big_brain request with file and symbol references ---');
    const toolRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
            name: "ask_big_brain",
            arguments: {
                question: "Please analyze the CONFIG object in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG and the generateFormattedOutput function in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#generateFormattedOutput"
            }
        }
    };
    
    server.stdin.write(JSON.stringify(toolRequest) + '\n');
}, 500);

// Check output after a delay
setTimeout(() => {
    server.kill();
    console.log('\n--- Test completed ---');
    
    // Read the output file to check XML format
    const outputPath = path.join(os.tmpdir(), 'big_brain_output.txt');
    if (fs.existsSync(outputPath)) {
        const fileContent = fs.readFileSync(outputPath, 'utf8');
        console.log('\n--- Checking output file format ---');
        
        // Check for new XML tags
        if (fileContent.includes('<code>')) {
            console.log('✅ Found <code> wrapper tag');
        } else {
            console.log('❌ Missing <code> wrapper tag');
        }
        
        if (fileContent.includes('<file path=')) {
            console.log('✅ Found <file> tags with path attributes');
        } else {
            console.log('❌ Missing <file> tags');
        }
        
        if (fileContent.includes('<symbol path=') && fileContent.includes('name=')) {
            console.log('✅ Found <symbol> tags with path and name attributes');
        } else {
            console.log('⚠️  No <symbol> tags found (might be expected if symbols weren\'t extracted)');
        }
        
        // Show a sample of the output
        console.log('\n--- Sample of formatted output ---');
        const lines = fileContent.split('\n').slice(0, 30);
        console.log(lines.join('\n'));
    } else {
        console.log('❌ Output file not found at:', outputPath);
    }
    
    process.exit(0);
}, 3000);