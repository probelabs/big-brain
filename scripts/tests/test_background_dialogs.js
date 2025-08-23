#!/usr/bin/env node

import { exec, spawn } from 'child_process';

function testBackgroundDialogMethods() {
  console.log('Testing AppleScript dialog methods for background processes...');
  
  // Method 1: Standard (baseline)
  console.log('\n1. Testing standard osascript...');
  exec(`osascript -e 'display dialog "Method 1: Standard" buttons {"OK"} default button 1'`, (error) => {
    if (error) console.log('Method 1 failed:', error.message);
    else console.log('Method 1 success');
    
    // Method 2: Via open command
    console.log('\n2. Testing via open command...');
    exec(`echo 'display dialog "Method 2: Open command" buttons {"OK"} default button 1' > /tmp/test_script.scpt && open /tmp/test_script.scpt`, (error) => {
      if (error) console.log('Method 2 failed:', error.message);
      else console.log('Method 2 success');
      
      // Method 3: Force user session
      console.log('\n3. Testing with explicit user session...');
      const username = process.env.USER;
      exec(`sudo -u ${username} osascript -e 'display dialog "Method 3: User session" buttons {"OK"} default button 1'`, (error) => {
        if (error) console.log('Method 3 failed:', error.message);
        else console.log('Method 3 success');
        
        // Method 4: Spawn with different env
        console.log('\n4. Testing spawn with GUI environment...');
        const child = spawn('osascript', ['-e', 'display dialog "Method 4: Spawn GUI" buttons {"OK"} default button 1'], {
          stdio: 'inherit',
          env: { ...process.env, DISPLAY: ':0' }
        });
        
        child.on('close', (code) => {
          if (code !== 0) console.log('Method 4 failed with code:', code);
          else console.log('Method 4 success');
          
          // Method 5: Native notification (fallback)
          console.log('\n5. Testing native notification...');
          exec(`osascript -e 'display notification "Method 5: Notification works!" with title "Big Brain Test"'`, (error) => {
            if (error) console.log('Method 5 failed:', error.message);
            else console.log('Method 5 success');
            
            console.log('\nAll tests completed');
          });
        });
      });
    });
  });
}

// Simulate background process environment
process.env.DISPLAY = '';
testBackgroundDialogMethods();