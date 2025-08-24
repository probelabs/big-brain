#!/usr/bin/env node

// Test script to diagnose ChatGPT UI reading issues
// Run this manually: node test_chatgpt_ui_structure.js

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing ChatGPT UI Structure...\n');
console.log('This test will help diagnose why ChatGPT UI reading is failing.');
console.log('Make sure ChatGPT Desktop is open with at least one message.\n');

// Test 1: Check if UI reader script exists
console.log('1️⃣ Checking UI reader script locations...');
const possiblePaths = [
  path.join(__dirname, 'build', 'chatgpt_ui_reader_ultrafast.js'),
  path.join(__dirname, 'scripts', 'chatgpt', 'chatgpt_ui_reader_ultrafast.js'),
];

let readerPath = null;
for (const p of possiblePaths) {
  try {
    const fs = await import('fs');
    await fs.promises.access(p);
    console.log(`   ✅ Found: ${p}`);
    readerPath = p;
    break;
  } catch {
    console.log(`   ❌ Not found: ${p}`);
  }
}

if (!readerPath) {
  console.log('\n❌ ERROR: Could not find UI reader script!');
  process.exit(1);
}

// Test 2: Try to read UI
console.log('\n2️⃣ Attempting to read ChatGPT UI...');
console.log('   Note: If this fails with -1743, you need to grant accessibility permissions.\n');

const osascript = spawn('osascript', [readerPath]);
let output = '';
let error = '';

osascript.stdout.on('data', (data) => {
  output += data.toString();
});

osascript.stderr.on('data', (data) => {
  error += data.toString();
});

osascript.on('close', (code) => {
  if (error) {
    console.log('❌ ERROR Output:', error);
    
    if (error.includes('-1743')) {
      console.log('\n⚠️  PERMISSION ISSUE DETECTED!');
      console.log('   Please grant accessibility permissions:');
      console.log('   1. Open System Settings → Privacy & Security → Accessibility');
      console.log('   2. Add Terminal (or your terminal app) and enable it');
      console.log('   3. You may need to restart your terminal');
    } else if (error.includes('not found')) {
      console.log('\n⚠️  ChatGPT may have updated their UI structure.');
      console.log('   The targetPath [0, 0, 2] might need adjustment.');
    }
  } else if (output) {
    try {
      const data = JSON.parse(output);
      console.log('✅ Successfully read UI!');
      
      if (data.error) {
        console.log('   ⚠️ UI Reader returned error:', data.error);
      } else if (data.messages) {
        console.log(`   📝 Found ${data.messages.length} messages`);
        if (data.messages.length > 0) {
          console.log('   First message preview:', data.messages[0].substring(0, 100) + '...');
        }
        if (data.meta) {
          console.log(`   ⏱️ Read time: ${data.meta.ms}ms`);
          console.log(`   🔍 Nodes visited: ${data.meta.nodesVisited}`);
        }
      } else {
        console.log('   ⚠️ No messages found in response');
        console.log('   Response structure:', Object.keys(data));
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', e.message);
      console.log('   Raw output:', output.substring(0, 200));
    }
  } else {
    console.log('❌ No output received from UI reader');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Test complete!');
});