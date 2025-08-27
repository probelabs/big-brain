#!/usr/bin/env node

// Analyze the actual response from Probe to understand how to handle no-files case

import { extract } from '@buger/probe';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

async function analyzeProbeResponse() {
  console.log('🔍 Analyzing Probe extract responses\n');
  
  const tempDir = os.tmpdir();
  
  const testCases = [
    {
      name: "General question (NO file paths mentioned)",
      question: "What are the best practices for API design? How should I structure HTTP endpoints?"
    },
    {
      name: "Question with non-existent files",
      question: "Please check my code in src/missing.js and tell me what's wrong with it."
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📝 ${testCase.name}`);
    
    try {
      // Write question to temp file
      const tempFile = path.join(tempDir, `test_question_${Date.now()}.txt`);
      await fs.writeFile(tempFile, testCase.question);
      
      // Run Probe extract with json: false to get raw output
      const result = await extract({
        inputFile: tempFile,
        format: 'json',
        json: false,  // Get raw output like BigBrain does
        allowTests: true,
        noGitignore: true
      });
      
      console.log(`Raw response (${result.length} chars):`);
      console.log('=====================================');
      console.log(result);
      console.log('=====================================\n');
      
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(result);
        console.log(`✅ Valid JSON with ${parsed.results?.length || 0} results\n`);
      } catch (e) {
        console.log(`❌ Not valid JSON - this is diagnostic output\n`);
        
        // Analyze the content to understand patterns
        if (result.includes('Reading from file:')) {
          console.log(`📋 Pattern: Contains "Reading from file:" - likely diagnostic`);
        }
        if (result.includes('No files found')) {
          console.log(`📋 Pattern: Contains "No files found" - explicit no-files message`);
        }
        if (result.includes('ERROR') || result.includes('Error')) {
          console.log(`📋 Pattern: Contains error message - actual error`);
        }
        console.log('');
      }
      
      // Clean up
      await fs.unlink(tempFile);
      
    } catch (error) {
      console.log(`❌ Exception: ${error.message}\n`);
    }
  }
}

analyzeProbeResponse().catch(console.error);