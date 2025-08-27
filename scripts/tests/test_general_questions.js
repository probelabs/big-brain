#!/usr/bin/env node

// Test BigBrain with general questions (no file references)

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function testGeneralQuestions() {
  console.log('🧪 Testing BigBrain with General Questions (No Files)\n');
  
  const testCases = [
    {
      name: "General API Design Question",
      question: "What are the best practices for designing REST APIs? How should I structure HTTP endpoints and handle authentication?"
    },
    {
      name: "Architecture Question", 
      question: "What's the difference between microservices and monolithic architecture? When should I choose one over the other?"
    },
    {
      name: "Question with Non-existent File (should fail)",
      question: "Please review my code in src/missing.js and tell me what's wrong with the authentication logic."
    }
  ];
  
  // Import BigBrain's tool handler
  let toolCallHandler;
  try {
    const bigBrainModule = await import('../../build/index.js');
    // The build/index.js exports the server setup, we need to access the tool handler
    console.log('✅ BigBrain module loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load BigBrain module:', error.message);
    console.log('\n💡 Make sure to run: npm run build');
    process.exit(1);
  }
  
  // Test each case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`   Question: "${testCase.question.substring(0, 80)}..."`);
    
    try {
      // Create a mock MCP request
      const mockRequest = {
        params: {
          name: 'ask_big_brain',
          arguments: {
            question: testCase.question
          }
        }
      };
      
      // For now, just verify the module loads correctly
      // Full integration testing would require setting up MCP server
      console.log(`   ✅ Test case prepared (question length: ${testCase.question.length} chars)`);
      
      // Analyze the question to predict expected behavior
      const hasFilePaths = /\\b[\\w-]+\\.[\\w]+\\b/.test(testCase.question) && 
                          (testCase.question.includes('src/') || 
                           testCase.question.includes('my code') ||
                           testCase.question.includes('review'));
      
      if (hasFilePaths && testCase.question.includes('missing')) {
        console.log(`   🔍 Expected: Should FAIL (file referenced but missing)`);
      } else if (!hasFilePaths) {
        console.log(`   🔍 Expected: Should SUCCEED (general question, no files)`);
      } else {
        console.log(`   🔍 Expected: Depends on file existence`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Manual Testing Instructions:');
  console.log('To fully test these cases:');
  console.log('1. Start BigBrain: npx @probelabs/big-brain@latest');
  console.log('2. Use MCP Inspector: npm run inspector');
  console.log('3. Call ask_big_brain tool with each question above');
  console.log('4. Verify general questions work, file-missing questions fail');
  
  console.log('\n✅ Test preparation complete!');
}

testGeneralQuestions().catch(console.error);