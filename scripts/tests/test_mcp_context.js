#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';

// Test Big Brain with different AppleScript methods in MCP context
function testMCPContext() {
  console.log('Testing MCP context dialog methods...');
  
  // Create modified version of Big Brain with different dialog methods
  const testScript = `
import { exec } from 'child_process';

// Method 1: Standard osascript  
function testMethod1() {
  console.log('Testing Method 1: Standard osascript');
  exec('osascript -e \\'display dialog "Method 1 from MCP" buttons {"OK"} default button 1\\'', (error) => {
    if (error) console.log('Method 1 failed:', error.message);
    else console.log('Method 1 success');
    testMethod2();
  });
}

// Method 2: Via file and open
function testMethod2() {
  console.log('Testing Method 2: Via open command');
  exec('echo \\'display dialog "Method 2 from MCP" buttons {"OK"} default button 1\\' > /tmp/mcp_test.scpt && open /tmp/mcp_test.scpt', (error) => {
    if (error) console.log('Method 2 failed:', error.message);
    else console.log('Method 2 success');
    testMethod3();
  });
}

// Method 3: Force user context
function testMethod3() {
  console.log('Testing Method 3: User context');
  const username = process.env.USER;
  exec(\`sudo -u \${username} osascript -e 'display dialog "Method 3 from MCP" buttons {"OK"} default button 1'\`, (error) => {
    if (error) console.log('Method 3 failed:', error.message);
    else console.log('Method 3 success');
    testMethod4();
  });
}

// Method 4: Notification fallback
function testMethod4() {
  console.log('Testing Method 4: Notification');
  exec('osascript -e \\'display notification "Method 4 from MCP works!" with title "Big Brain MCP"\\'', (error) => {
    if (error) console.log('Method 4 failed:', error.message);
    else console.log('Method 4 success');
    console.log('All MCP tests completed');
    process.exit(0);
  });
}

// Read from stdin (MCP mode)
process.stdin.on('data', (data) => {
  try {
    const request = JSON.parse(data.toString());
    if (request.method === 'test/dialog') {
      testMethod1();
    }
  } catch (e) {
    console.error('Parse error:', e);
  }
});

console.log('MCP test server ready');
`;

  // Write test script
  fs.writeFileSync('/tmp/mcp_dialog_test.js', testScript);
  
  // Spawn like Claude Code would
  const child = spawn('node', ['/tmp/mcp_dialog_test.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: false, // Simulate MCP context
    env: { ...process.env, TERM: undefined } // Remove terminal info
  });
  
  child.stdout.on('data', (data) => {
    console.log('MCP Output:', data.toString().trim());
  });
  
  child.stderr.on('data', (data) => {
    console.log('MCP Error:', data.toString().trim());
  });
  
  // Send test request after server starts
  setTimeout(() => {
    const testRequest = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "test/dialog"
    });
    
    child.stdin.write(testRequest + '\\n');
  }, 1000);
  
  // Cleanup after test
  setTimeout(() => {
    child.kill();
    console.log('MCP context test completed');
  }, 10000);
}

testMCPContext();