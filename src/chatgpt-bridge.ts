/**
 * ChatGPT Desktop Integration Bridge
 * ------------------------------------
 * Provides automated interaction with ChatGPT Desktop app on macOS
 * using Terminal-based execution for proper permissions.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);

interface ChatGPTBridgeOptions {
  checkInterval?: number;
  stableChecks?: number;
  maxWaitTime?: number;
  debug?: boolean;
}

interface ChatGPTResponse {
  success: boolean;
  message: string;
  response?: string;
  error?: string;
  elapsed: number;
  metrics?: {
    uiReads: number;
    totalReadTime: number;
    focusTime: number;
    pasteTime: number;
    waitingTime: number;
  };
}

export class ChatGPTBridge {
  private checkInterval: number;
  private stableChecks: number;
  private maxWaitTime: number;
  private debug: boolean;

  constructor(options: ChatGPTBridgeOptions = {}) {
    this.checkInterval = options.checkInterval || 5000;  // Check every 5 seconds (less aggressive)
    this.stableChecks = options.stableChecks || 2;  // Only need 2 stable reads
    this.maxWaitTime = options.maxWaitTime || 1200000;  // 20 minutes default timeout (for ChatGPT Pro thinking)
    this.debug = options.debug || false;
  }

  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Query ChatGPT with a message and return the response
   * Always uses Terminal execution for proper permissions
   */
  public async query(message: string, newChat: boolean = true): Promise<ChatGPTResponse> {
    const startTime = Date.now();
    
    console.log('[ChatGPT Bridge] Starting ChatGPT Query via Terminal');
    console.log(`[ChatGPT Bridge] Message length: ${message.length} chars`);
    
    // Declare variables outside try block for cleanup access
    const tempDir = os.tmpdir();
    const scriptId = Date.now();
    const tempScript = path.join(tempDir, `chatgpt_query_${scriptId}.mjs`);  // Use .mjs for ES modules
    const responseFile = path.join(tempDir, `chatgpt_response_${scriptId}.json`);
    const messageFile = path.join(tempDir, `chatgpt_message_${scriptId}.txt`);
    const shellWrapper = path.join(tempDir, `run_chatgpt_${scriptId}.sh`);
    
    try {
      
      // Write message to file (to avoid escaping issues)
      await fs.writeFile(messageFile, message, 'utf8');
      
      // Get the directory where the UI reader script should be
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      // Create the automation script that will run in Terminal
      const scriptContent = `#!/usr/bin/env node

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
    await execAsync("osascript -e 'tell application \\"ChatGPT\\" to activate'");
    await this.wait(500);
    this.metrics.focusTime = Date.now() - start;
  }

  async createNewChat() {
    console.log('[Terminal] Creating new chat...');
    await execAsync("osascript -e 'tell application \\"System Events\\" to keystroke \\"n\\" using command down'");
    await this.wait(1500);
  }

  async pasteMessage(message) {
    const start = Date.now();
    console.log('[Terminal] Setting clipboard and pasting...');
    
    // Use a temp file for clipboard to handle special characters
    const clipFile = '${messageFile}';
    await execAsync(\`cat '\${clipFile}' | pbcopy\`);
    await this.wait(200);
    
    // Paste with Cmd+V
    await execAsync("osascript -e 'tell application \\"System Events\\" to keystroke \\"v\\" using command down'");
    await this.wait(300);
    
    // Send with Enter
    console.log('[Terminal] Sending message...');
    await execAsync("osascript -e 'tell application \\"System Events\\" to key code 36'");
    await this.wait(1500);
    
    this.metrics.pasteTime = Date.now() - start;
  }

  async readUI() {
    const start = Date.now();
    this.metrics.uiReads++;
    
    try {
      // Look for UI reader script in various locations
      const readerPaths = [
        '${path.join(__dirname, 'chatgpt_ui_reader_ultrafast.js')}',
        '${path.join(__dirname, '..', 'chatgpt_ui_reader_ultrafast.js')}',
        '${path.join(process.cwd(), 'build', 'chatgpt_ui_reader_ultrafast.js')}',
        '${path.join(process.cwd(), 'chatgpt_ui_reader_ultrafast.js')}'
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
      
      const { stdout } = await execAsync(\`osascript -l JavaScript \${readerScript}\`);
      const result = JSON.parse(stdout);
      
      const readTime = Date.now() - start;
      this.metrics.totalReadTime += readTime;
      
      return result;
    } catch (error) {
      console.error('[Terminal] UI read error:', error.message);
      return { error: error.message };
    }
  }

  async waitForResponse() {
    console.log('[Terminal] Waiting for response...');
    const startTime = Date.now();
    let lastResponse = null;
    let stableCount = 0;
    
    while (Date.now() - startTime < ${this.maxWaitTime}) {
      const uiData = await this.readUI();
      
      if (!uiData.error && uiData.messages && uiData.messages.length > 1) {
        // Get the last message (AI response)
        const aiResponse = uiData.messages[uiData.messages.length - 1];
        
        if (aiResponse && aiResponse.trim().length > 0) {
          if (aiResponse === lastResponse) {
            stableCount++;
            if (stableCount >= ${this.stableChecks}) {
              this.metrics.waitingTime = Date.now() - startTime;
              console.log('[Terminal] Response complete');
              return aiResponse;
            }
          } else {
            stableCount = 0;
            lastResponse = aiResponse;
          }
        }
      }
      
      await this.wait(${this.checkInterval});
    }
    
    this.metrics.waitingTime = Date.now() - startTime;
    return lastResponse || null;
  }

  async run() {
    const startTime = Date.now();
    
    try {
      // Read message from file
      const message = await fs.readFile('${messageFile}', 'utf8');
      
      // Step 1: Focus ChatGPT
      await this.focusChatGPT();
      
      // Step 2: Create new chat if requested
      ${newChat ? 'await this.createNewChat();' : '// Skip new chat'}
      
      // Step 3: Paste and send message
      await this.pasteMessage(message);
      
      // Step 4: Wait for response
      const response = await this.waitForResponse();
      
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Write response to file
      const result = {
        success: true,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        response: response,
        elapsed: elapsed,
        metrics: this.metrics
      };
      
      await fs.writeFile('${responseFile}', JSON.stringify(result, null, 2));
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
      
      await fs.writeFile('${responseFile}', JSON.stringify(result, null, 2));
      console.error('[Terminal] Error:', error.message);
    }
  }
}

// Run the automation
const automation = new ChatGPTAutomation();

// Set a hard timeout to ensure Terminal closes
setTimeout(() => {
  console.error('[Terminal] Hard timeout reached, forcing exit');
  process.exit(2);
}, ${this.maxWaitTime + 10000});  // Add 10 seconds to the max wait time

automation.run().then(() => {
  console.log('[Terminal] Automation complete, exiting...');
  setTimeout(() => process.exit(0), 100);  // Small delay to ensure logs are written
}).catch(err => {
  console.error('[Terminal] Fatal error:', err);
  setTimeout(() => process.exit(1), 100);  // Small delay to ensure logs are written
});
`;

      // Write the script
      await fs.writeFile(tempScript, scriptContent, 'utf8');
      
      console.log('[ChatGPT Bridge] Launching Terminal automation...');
      
      // Create a shell wrapper that ensures Terminal closes
      const shellContent = `#!/bin/bash
# Run the node script
node ${tempScript}
EXIT_CODE=$?

# Close the Terminal window after completion
osascript -e 'tell application "Terminal" to close front window' &

exit $EXIT_CODE
`;
      await fs.writeFile(shellWrapper, shellContent, { mode: 0o755 });
      
      // Launch the shell wrapper in Terminal
      await execAsync(`
        osascript -e '
          tell application "Terminal"
            activate
            do script "bash ${shellWrapper}"
          end tell
        '
      `);
      
      console.log('[ChatGPT Bridge] Terminal launched, waiting for response...');
      
      // Wait for response file with timeout
      const checkStart = Date.now();
      while (Date.now() - checkStart < this.maxWaitTime) {
        if (await fs.pathExists(responseFile)) {
          // Give it a moment to finish writing
          await this.wait(500);
          
          try {
            const responseData = await fs.readFile(responseFile, 'utf8');
            const result = JSON.parse(responseData) as ChatGPTResponse;
            
            // Cleanup temp files
            await fs.unlink(tempScript).catch(() => {});
            await fs.unlink(shellWrapper).catch(() => {});
            await fs.unlink(responseFile).catch(() => {});
            await fs.unlink(messageFile).catch(() => {});
            
            const totalTime = Date.now() - startTime;
            console.log(`[ChatGPT Bridge] Completed in ${Math.round(totalTime / 1000)}s`);
            
            return result;
          } catch (parseError: any) {
            console.error('[ChatGPT Bridge] Failed to parse response:', parseError.message);
          }
        }
        
        await this.wait(1000);
      }
      
      // Timeout - cleanup and return error
      await fs.unlink(tempScript).catch(() => {});
      await fs.unlink(shellWrapper).catch(() => {});
      await fs.unlink(messageFile).catch(() => {});
      
      throw new Error(`ChatGPT automation timed out after ${this.maxWaitTime}ms`);
      
    } catch (error: any) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.error('[ChatGPT Bridge] Error:', error.message);
      
      return {
        success: false,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        error: error.message,
        elapsed: elapsed
      };
    }
  }
}

/**
 * Helper function to check if ChatGPT app is installed
 */
export async function isChatGPTInstalled(): Promise<boolean> {
  try {
    // Check if ChatGPT app exists (not necessarily running)
    await execAsync(`osascript -e 'tell application "ChatGPT" to name'`);
    return true;
  } catch {
    // If the app doesn't exist, the command will fail
    return false;
  }
}

/**
 * Helper function to ensure UI reader scripts are available
 */
export async function ensureReaderScripts(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Check if reader script exists in build directory
  const readerPath = path.join(__dirname, 'chatgpt_ui_reader_ultrafast.js');
  
  // The script should be copied during build process
  if (!await fs.pathExists(readerPath)) {
    console.warn('[ChatGPT Bridge] UI reader script not found at:', readerPath);
    console.warn('[ChatGPT Bridge] Make sure to run: cp chatgpt_ui_reader_ultrafast.js build/');
  }
}