#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class ChatGPTAutomation {
  constructor() {
    this.metrics = {
      uiReads: 0,
      totalReadTime: 0,
      focusTime: 0,
      pasteTime: 0,
      waitingTime: 0
    };
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async focusChatGPT() {
    const start = Date.now();
    console.log('[Terminal] Focusing ChatGPT...');
    await execAsync('osascript -e \'tell application "ChatGPT" to activate\'');
    await this.wait(1500);
    this.metrics.focusTime = Date.now() - start;
  }

  async createNewChat() {
    console.log('[Terminal] Creating new chat...');
    await execAsync('osascript -e \'tell application "System Events" to keystroke "n" using command down\'');
    await this.wait(2000);
  }

  async pasteMessage(message) {
    const start = Date.now();
    console.log('[Terminal] Pasting message...');
    
    // Set clipboard and paste
    const escapedMessage = message.replace(/'/g, "'\\''");
    await execAsync(`osascript -e 'set the clipboard to "'"${escapedMessage}"'"'`);
    await this.wait(500);
    
    await execAsync('osascript -e \'tell application "System Events" to keystroke "v" using command down\'');
    await this.wait(1000);
    
    console.log('[Terminal] Sending message...');
    await execAsync('osascript -e \'tell application "System Events" to keystroke return\'');
    
    this.metrics.pasteTime = Date.now() - start;
  }

  async readUI() {
    const start = Date.now();
    this.metrics.uiReads++;
    
    try {
      // Look for UI reader script in various locations
      const readerPaths = [
        '{{READER_PATH_1}}',
        '{{READER_PATH_2}}',
        '{{READER_PATH_3}}',
        '{{READER_PATH_4}}'
      ];
      
      let readerScript = null;
      for (const p of readerPaths) {
        try {
          await fs.access(p);
          readerScript = p;
          break;
        } catch {}
      }
      
      if (!readerScript) {
        console.error('[Terminal] UI reader script not found in any of:', readerPaths);
        return { error: 'UI reader script not found' };
      }
      
      const { stdout } = await execAsync(`osascript -l JavaScript ${readerScript}`);
      const result = JSON.parse(stdout);
      
      const readTime = Date.now() - start;
      this.metrics.totalReadTime += readTime;
      
      return result;
    } catch (error) {
      console.error('[Terminal] UI read error:', error.message);
      return { error: error.message };
    }
  }

  async waitForResponse(originalMessage) {
    console.log('[Terminal] Waiting for response...');
    
    // Extract first 100 chars of the user message for validation
    const messagePreview = originalMessage ? 
      originalMessage.substring(0, 100).replace(/\n/g, ' ').trim() : '';
    
    const startTime = Date.now();
    let lastResponse = null;
    let stableCount = 0;
    let checkNumber = 0;
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let lastStatus = '';
    let lastPreview = '';
    let conversationValidated = false;
    
    while (Date.now() - startTime < {{MAX_WAIT_TIME}}) {
      checkNumber++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const spinner = spinnerFrames[checkNumber % spinnerFrames.length];
      const uiData = await this.readUI();
      
      let status = '';
      let showPreview = false;
      let isNewState = false;
      
      if (uiData.error) {
        status = `UI read error - ${uiData.error}`;
        if (status !== lastStatus) {
          process.stdout.write('\n');
          console.log(`[Terminal] ⚠️  ${status}`);
          lastStatus = status;
        }
      } else if (!uiData.messages || uiData.messages.length === 0) {
        status = 'No messages found yet';
      } else if (uiData.messages.length === 1) {
        status = 'Waiting for AI response...';
      } else if (uiData.messages && uiData.messages.length > 1) {
        // Validate conversation context on first detection of multiple messages
        if (!conversationValidated && messagePreview) {
          const userMessage = uiData.messages[uiData.messages.length - 2];
          if (userMessage) {
            const userMessageStart = userMessage.substring(0, 100).replace(/\n/g, ' ').trim();
            
            // Check if the user message in UI matches what we sent
            if (!userMessageStart.includes(messagePreview.substring(0, 50)) && 
                !messagePreview.includes(userMessageStart.substring(0, 50))) {
              process.stdout.write('\r\x1b[K');
              console.log(`[Terminal] ⚠️  Warning: Conversation mismatch detected!`);
              console.log(`[Terminal]    Expected: "${messagePreview.substring(0, 50)}..."`);
              console.log(`[Terminal]    Found: "${userMessageStart.substring(0, 50)}..."`);
              console.log(`[Terminal] ❌ Aborting - wrong conversation thread`);
              throw new Error('Wrong conversation thread - user message does not match');
            }
            conversationValidated = true;
            console.log(`[Terminal] ✓ Conversation validated - correct thread`);
          }
        }
        
        // Get the last message (AI response)
        const aiResponse = uiData.messages[uiData.messages.length - 1];
        
        if (aiResponse && aiResponse.trim().length > 0) {
          const responseLength = aiResponse.length;
          const preview = aiResponse.substring(0, 80).replace(/\n/g, ' ');
          
          if (aiResponse === lastResponse) {
            stableCount++;
            status = `Response stable (${responseLength} chars) - Confirming: ${stableCount}/{{STABLE_CHECKS}}`;
            
            if (stableCount >= {{STABLE_CHECKS}}) {
              this.metrics.waitingTime = Date.now() - startTime;
              process.stdout.write('\r\x1b[K');
              console.log(`[Terminal] ✅ Response confirmed stable after ${elapsed} seconds`);
              return aiResponse;
            }
          } else {
            if (lastResponse === null) {
              status = `AI responding... (${responseLength} chars)`;
              isNewState = true;
            } else {
              const sizeDiff = responseLength - (lastResponse ? lastResponse.length : 0);
              const diffStr = sizeDiff > 0 ? `+${sizeDiff}` : `${sizeDiff}`;
              status = `AI still typing... (${diffStr} chars, total: ${responseLength})`;
            }
            
            // Show preview when response changes significantly or is first detected
            if (preview !== lastPreview || isNewState) {
              showPreview = true;
              lastPreview = preview;
            }
            
            stableCount = 0;
            lastResponse = aiResponse;
          }
        } else {
          status = 'Empty AI response';
        }
      }
      
      // Update the status line
      if (status !== lastStatus || showPreview) {
        if (showPreview && lastPreview) {
          process.stdout.write('\r\x1b[K');
          console.log(`[Terminal] 💬 "${lastPreview}..."`);
        }
        lastStatus = status;
      }
      
      // Write the updating status line
      const statusLine = `[Terminal] ${spinner} Check #${checkNumber} (${elapsed}s): ${status}`;
      process.stdout.write(`\r\x1b[K${statusLine}`);
      
      await this.wait({{CHECK_INTERVAL}});
    }
    
    this.metrics.waitingTime = Date.now() - startTime;
    const totalSeconds = Math.round(this.metrics.waitingTime / 1000);
    process.stdout.write('\r\x1b[K');
    console.log(`[Terminal] ⏱️ Timeout reached after ${totalSeconds} seconds`);
    return lastResponse || null;
  }

  async run() {
    const startTime = Date.now();
    
    try {
      // Read message from file
      const message = await fs.readFile('{{MESSAGE_FILE}}', 'utf8');
      
      // Step 1: Focus ChatGPT
      await this.focusChatGPT();
      
      // Step 2: Create new chat if requested
      {{NEW_CHAT_CODE}}
      
      // Step 3: Paste and send message
      await this.pasteMessage(message);
      
      // Step 4: Wait for response (pass message for validation)
      const response = await this.waitForResponse(message);
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Write response to file
      const result = {
        success: true,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        response: response,
        elapsed: elapsed,
        metrics: this.metrics
      };
      
      await fs.writeFile('{{RESPONSE_FILE}}', JSON.stringify(result, null, 2));
      console.log('[Terminal] Response saved to file');
      
    } catch (error) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const result = {
        success: false,
        message: '',
        error: error.message,
        elapsed: elapsed,
        metrics: this.metrics
      };
      
      await fs.writeFile('{{RESPONSE_FILE}}', JSON.stringify(result, null, 2));
      console.error('[Terminal] Error:', error.message);
    }
  }
}

// Run the automation
const automation = new ChatGPTAutomation();
automation.run().catch(console.error);