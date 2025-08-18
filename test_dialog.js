#!/usr/bin/env node

// Simple test to trigger the Big Brain MCP server with sound and dialog
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Create a test file for extraction
const testFile = join(tmpdir(), 'test_big_brain.js');
writeFileSync(testFile, `
function testFunction() {
  console.log("Hello from test function!");
  return 42;
}

class TestClass {
  constructor() {
    this.value = "test";
  }
}
`);

// Simulate MCP call
const mcpRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "ask_big_brain",
    arguments: {
      question: `Please analyze the test function in ${testFile}#testFunction and the TestClass. This is a simple test to verify the sound and dialog features work correctly.`
    }
  }
};

console.log('Sending MCP request to test sound and dialog...');
console.log('Question:', mcpRequest.params.arguments.question);

const child = spawn('npx', ['-y', '@buger/big-brain@latest', '--sound', '--dialog'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdin.write(JSON.stringify(mcpRequest) + '\n');
child.stdin.end();

child.stdout.on('data', (data) => {
  console.log('MCP Response:', data.toString());
});

child.stderr.on('data', (data) => {
  console.error('MCP Error:', data.toString());
});

child.on('close', (code) => {
  console.log(`MCP server exited with code ${code}`);
});

// Timeout after 10 seconds
setTimeout(() => {
  child.kill();
  console.log('Test completed');
}, 10000);