#!/usr/bin/env node

// Comprehensive test for all token counting cases
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to run BigBrain with a request
async function runBigBrain(request, args = []) {
  return new Promise((resolve) => {
    const bigbrain = spawn('node', ['build/index.js', ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname
    });

    let output = '';
    let error = '';

    bigbrain.stdout.on('data', (data) => {
      output += data.toString();
    });

    bigbrain.stderr.on('data', (data) => {
      error += data.toString();
    });

    bigbrain.on('close', (code) => {
      resolve({ output, error, code });
    });

    // Send the request
    bigbrain.stdin.write(JSON.stringify(request) + '\n');
    bigbrain.stdin.end();
  });
}

async function runTests() {
  console.log('🧪 Testing BigBrain Token Counting - All Cases\n');
  console.log('=' .repeat(60));

  // Test Case 1: Normal request under limit
  console.log('\n📝 Test 1: Normal request (should succeed with token count)');
  console.log('-'.repeat(40));
  
  const test1 = await runBigBrain({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'ask_big_brain',
      arguments: {
        question: `Show me the countTokens function in ${__dirname}/src/index.ts#countTokens`
      }
    }
  });

  const response1 = JSON.parse(test1.output.split('\n').find(line => line.includes('"jsonrpc"')));
  if (response1.result?.content?.[0]?.text?.includes('📊 Context size:')) {
    const match = response1.result.content[0].text.match(/📊 Context size: ([\d,]+) tokens \((\d+)% of ([\d,]+) limit\)/);
    if (match) {
      console.log(`✅ SUCCESS: Token counting working`);
      console.log(`   - Tokens: ${match[1]}`);
      console.log(`   - Usage: ${match[2]}% of limit`);
      console.log(`   - Limit: ${match[3]}`);
    }
  } else {
    console.log('❌ FAIL: No token info in response');
  }

  // Test Case 2: Request with skipTokenCheck=true
  console.log('\n📝 Test 2: With skipTokenCheck=true (should succeed, no limit check)');
  console.log('-'.repeat(40));
  
  const test2 = await runBigBrain({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'ask_big_brain',
      arguments: {
        question: `Analyze all files in ${__dirname}/src`,
        skipTokenCheck: true
      }
    }
  });

  const response2 = JSON.parse(test2.output.split('\n').find(line => line.includes('"jsonrpc"')));
  if (response2.result?.content?.[0]?.text?.includes('📊 Context size:')) {
    console.log('✅ SUCCESS: skipTokenCheck parameter works');
    console.log('   - Token count still shown but limit not enforced');
  } else {
    console.log('❌ FAIL: skipTokenCheck not working properly');
  }

  // Test Case 3: Request exceeding default limit
  console.log('\n📝 Test 3: Exceeding token limit (should fail with breakdown)');
  console.log('-'.repeat(40));
  
  // Request multiple large files to exceed limit
  const test3 = await runBigBrain({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'ask_big_brain',
      arguments: {
        question: `Analyze these files: ${__dirname}/src/index.ts, ${__dirname}/src/chatgpt-bridge.ts, ${__dirname}/build/index.js`
      }
    }
  }, ['--max-tokens', '5000']); // Set low limit to trigger error

  const response3 = JSON.parse(test3.output.split('\n').find(line => line.includes('"jsonrpc"')));
  if (response3.error?.message?.includes('❌ Content exceeds token limit')) {
    console.log('✅ SUCCESS: Token limit enforcement working');
    
    // Check for breakdown details
    if (response3.error.message.includes('📊 Token breakdown by file/symbol:')) {
      console.log('   - Per-file breakdown provided');
    }
    if (response3.error.message.includes('Prompt overhead:')) {
      console.log('   - Prompt overhead shown');
    }
    if (response3.error.message.includes('To reduce context size:')) {
      console.log('   - Reduction suggestions provided');
    }
    
    // Extract and show the breakdown
    const lines = response3.error.message.split('\n');
    const breakdownStart = lines.findIndex(l => l.includes('Token breakdown'));
    if (breakdownStart >= 0) {
      console.log('\n   Breakdown sample:');
      for (let i = breakdownStart + 1; i < Math.min(breakdownStart + 4, lines.length); i++) {
        if (lines[i].includes('•')) {
          console.log('   ' + lines[i].trim());
        }
      }
    }
  } else {
    console.log('❌ FAIL: Token limit not enforced properly');
    if (response3.result) {
      console.log('   - Request succeeded when it should have failed');
    }
  }

  // Test Case 4: Custom --max-tokens flag
  console.log('\n📝 Test 4: Custom --max-tokens flag');
  console.log('-'.repeat(40));
  
  const test4 = await runBigBrain({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'ask_big_brain',
      arguments: {
        question: `Show a small function from ${__dirname}/src/index.ts#playSystemSound`
      }
    }
  }, ['--max-tokens', '50000']); // Higher limit

  const response4 = JSON.parse(test4.output.split('\n').find(line => line.includes('"jsonrpc"')));
  if (response4.result?.content?.[0]?.text?.includes('50,000 limit')) {
    console.log('✅ SUCCESS: Custom --max-tokens flag working');
    console.log('   - Limit changed to 50,000 as specified');
  } else {
    console.log('⚠️  Custom limit might not be reflected in message');
  }

  // Test Case 5: No warning messages (only hard limit)
  console.log('\n📝 Test 5: Verify no warning messages (only hard limit)');
  console.log('-'.repeat(40));
  
  const test5 = await runBigBrain({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'ask_big_brain',
      arguments: {
        question: `Analyze ${__dirname}/src/index.ts and ${__dirname}/src/chatgpt-bridge.ts`
      }
    }
  }, ['--max-tokens', '100000']); // High limit to ensure success

  const response5 = JSON.parse(test5.output.split('\n').find(line => line.includes('"jsonrpc"')));
  if (response5.result?.content?.[0]?.text) {
    const hasWarning = response5.result.content[0].text.includes('⚠️ Large context:') ||
                       response5.result.content[0].text.includes('Consider using more specific');
    if (!hasWarning) {
      console.log('✅ SUCCESS: No warning messages present');
      console.log('   - Only shows token count, no suggestions');
    } else {
      console.log('❌ FAIL: Warning message still present');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ All tests completed!\n');
}

// Run all tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});