#!/usr/bin/env node

// Test how Probe extract behaves with different question types

import { extract } from '@buger/probe';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

async function testProbeExtract() {
  console.log('🧪 Testing Probe extract behavior with different question types\n');
  
  const tempDir = os.tmpdir();
  
  const testCases = [
    {
      name: "Question with NO file references (general question)",
      question: "What are the best practices for designing REST APIs? I need general guidance on HTTP methods, status codes, and URL structure."
    },
    {
      name: "Question with INVALID file references", 
      question: "Please review my code in src/nonexistent.js and fix the bug in utils/missing.py"
    },
    {
      name: "Question with VALID file references",
      question: "Please review my code in package.json"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 ${testCase.name}`);
    console.log(`   Question: "${testCase.question.substring(0, 80)}..."`);
    
    try {
      // Write question to temp file
      const tempFile = path.join(tempDir, `test_question_${Date.now()}.txt`);
      await fs.writeFile(tempFile, testCase.question);
      
      // Run Probe extract
      const result = await extract({
        inputFile: tempFile,
        format: 'json',
        json: false,
        allowTests: true,
        noGitignore: true
      });
      
      console.log(`   ✅ Success: ${typeof result} (length: ${result?.length || 'N/A'})`);
      
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          const resultCount = parsed.results ? parsed.results.length : 0;
          console.log(`   📊 Results: ${resultCount} items found`);
          if (parsed.results && parsed.results.length > 0) {
            console.log(`   📁 First result: ${parsed.results[0].file}`);
          }
        } catch (e) {
          console.log(`   📊 Raw string result (${result.length} chars): "${result.substring(0, 100)}..."`);
        }
      }
      
      // Clean up
      await fs.unlink(tempFile);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('Test complete! This helps understand how to distinguish:');
  console.log('• No files mentioned → Should continue without files');
  console.log('• Files mentioned but missing → Should show error');
}

testProbeExtract().catch(console.error);