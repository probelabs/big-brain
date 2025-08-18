#!/usr/bin/env node

import { exec } from 'child_process';

// Test different AppleScript execution methods
function testDialogMethods() {
  console.log('Testing different dialog methods...');
  
  // Method 1: Standard osascript
  const script1 = `osascript -e 'display dialog "Test 1: Standard" buttons {"OK"} default button 1'`;
  
  // Method 2: osascript with explicit app target  
  const script2 = `osascript -e 'tell application "System Events" to display dialog "Test 2: System Events" buttons {"OK"} default button 1'`;
  
  // Method 3: osascript with Finder as target
  const script3 = `osascript -e 'tell application "Finder" to display dialog "Test 3: Finder" buttons {"OK"} default button 1'`;
  
  // Method 4: Using open command to run AppleScript
  const script4 = `echo 'display dialog "Test 4: Via open" buttons {"OK"} default button 1' | osascript`;
  
  console.log('Running Test 1 (standard)...');
  exec(script1, (error, stdout, stderr) => {
    if (error) console.log('Test 1 failed:', error.message);
    else console.log('Test 1 success');
    
    console.log('Running Test 2 (System Events)...');
    exec(script2, (error, stdout, stderr) => {
      if (error) console.log('Test 2 failed:', error.message);
      else console.log('Test 2 success');
      
      console.log('Running Test 3 (Finder)...');
      exec(script3, (error, stdout, stderr) => {
        if (error) console.log('Test 3 failed:', error.message);
        else console.log('Test 3 success');
        
        console.log('Running Test 4 (pipe)...');
        exec(script4, (error, stdout, stderr) => {
          if (error) console.log('Test 4 failed:', error.message);
          else console.log('Test 4 success');
          
          console.log('All tests completed');
        });
      });
    });
  });
}

testDialogMethods();