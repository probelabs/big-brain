#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Big Brain MCP Server
 * --------------------
 * This module sets up an MCP server to handle requests for "ask_big_brain".
 * It enforces absolute file paths, validates file sizes and extensions, and
 * provides clearer error handling and documentation.
 */

import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import clipboardy from 'clipboardy';
import { exec } from 'child_process';
// @ts-ignore - @buger/probe doesn't have TypeScript declarations (using latest version)
import { extract } from '@buger/probe';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
  CallToolRequest
} from '@modelcontextprotocol/sdk/types.js';

// Parse command-line arguments
const args = process.argv.slice(2);

// Configuration
const CONFIG = {
  outputPath: path.join(os.tmpdir(), 'big_brain_output.txt'),
  maxFiles: 100,
  maxFileSize: 1_000_000, // 1 MB
  // Parse command-line flags - enabled by default, disable with flags
  enableSound: !args.includes('--disable-sound'),
  enableNotify: !args.includes('--disable-notification')
};

interface BigBrainArgs {
  question: string;
}

/**
 * Represents the content of a file along with its detected language (by extension).
 */
interface FileContent {
  path: string;
  content: string;
  language: string;
}

interface PlatformInfo {
  platform: string;
  isWSL: boolean;
}

/**
 * Detects the current platform with WSL support.
 * @returns Platform information including WSL detection
 */
function detectPlatform(): PlatformInfo {
  const platform = os.platform();
  
  // Check if running in WSL
  if (platform === 'linux') {
    try {
      const procVersion = fs.readFileSync('/proc/version', 'utf8');
      if (procVersion.toLowerCase().includes('microsoft')) {
        return { platform: 'wsl', isWSL: true };
      }
    } catch {
      // Ignore errors reading /proc/version
    }
  }
  
  return { platform, isWSL: false };
}

/**
 * Plays a system sound notification if enabled.
 */
function playSystemSound(): void {
  if (!CONFIG.enableSound) return;
  
  const { platform, isWSL } = detectPlatform();
  
  try {
    switch(platform) {
      case 'darwin':
        exec('afplay /System/Library/Sounds/Glass.aiff');
        break;
        
      case 'win32':
        exec('powershell -c "[Console]::Beep(1000, 500)"');
        break;
        
      case 'wsl':
        // Try Linux sound first, fallback to Windows
        exec('which paplay', (error) => {
          if (!error) {
            exec('paplay /usr/share/sounds/freedesktop/stereo/complete.oga');
          } else {
            exec('/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -c "[Console]::Beep(1000, 500)"');
          }
        });
        break;
        
      case 'linux':
        exec('paplay /usr/share/sounds/freedesktop/stereo/complete.oga || aplay /usr/share/sounds/alsa/Front_Center.wav');
        break;
    }
  } catch (error) {
    // Silent failure for sound - it's optional
    console.error('Sound playback failed:', error);
  }
}

/**
 * Shows a native OS dialog with the content if enabled, otherwise uses clipboard.
 * @param content - The formatted content to display
 * @param fileCount - Number of files extracted
 * @param originalQuestion - The user's original question
 */
async function handleOutput(content: string, fileCount: number, originalQuestion: string): Promise<void> {
  if (CONFIG.enableNotify) {
    await showNotificationAndCopy(content, fileCount, originalQuestion);
  } else {
    // Default behavior - copy to clipboard
    await clipboardy.write(content);
  }
  
  // Play sound if enabled (works with both dialog and clipboard modes)
  playSystemSound();
}

/**
 * Shows a native notification and copies content to clipboard.
 * @param content - The content to copy to clipboard
 * @param fileCount - Number of files extracted
 * @param originalQuestion - The user's original question
 */
async function showNotificationAndCopy(content: string, fileCount: number, originalQuestion: string): Promise<void> {
  const { platform } = detectPlatform();
  
  // Prepare display content with question
  const displayContent = `QUESTION: ${originalQuestion}\n\nCONTENT (${fileCount} files):\n${content}`;
  
  try {
    // Copy to clipboard first
    await clipboardy.write(displayContent);
    
    // Show platform-specific notification
    switch(platform) {
      case 'darwin':
        await showMacNotification(fileCount);
        break;
        
      case 'win32':
      case 'wsl':
        showWindowsNotification(fileCount);
        break;
        
      case 'linux':
        showLinuxNotification(fileCount);
        break;
        
      default:
        console.log(`Big Brain content ready! ${fileCount} files extracted and copied to clipboard.`);
    }
  } catch (error) {
    console.error('Notification failed:', error);
    console.log(`Big Brain content ready! ${fileCount} files extracted and saved to temp file.`);
  }
}

/**
 * Shows a macOS notification using AppleScript.
 */
async function showMacNotification(fileCount: number): Promise<void> {
  // Use terminal-notifier if available, fallback to osascript
  exec('which terminal-notifier', (error) => {
    if (!error) {
      // Use terminal-notifier which has better control over click behavior
      exec(`terminal-notifier -message "Content copied to clipboard! Paste into your AI system." -title "Big Brain" -subtitle "Ready for AI system"`, (error) => {
        if (error) {
          console.error('terminal-notifier failed:', error.message);
        }
      });
    } else {
      // Fallback to basic osascript notification
      exec(`osascript -e 'display notification "Big Brain: Content copied to clipboard! Paste into your AI system." with title "Big Brain"'`, (error) => {
        if (error) {
          console.error('macOS notification failed:', error.message);
        }
      });
    }
  });
}

/**
 * Shows a Windows notification.
 */
function showWindowsNotification(fileCount: number): void {
  const message = `Big Brain content copied to clipboard! ${fileCount} files extracted.`;
  exec(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('${message}', 'Big Brain')"`, (error) => {
    if (error) {
      console.error('Windows notification failed:', error.message);
    }
  });
}

/**
 * Shows a Linux notification.
 */
function showLinuxNotification(fileCount: number): void {
  exec('which notify-send', (error) => {
    if (!error) {
      exec(`notify-send "Big Brain (${fileCount} files)" "Content copied to clipboard! Paste into your AI system."`, (error) => {
        if (error) {
          console.error('Linux notification failed:', error.message);
        }
      });
    } else {
      console.log(`Big Brain: ${fileCount} files extracted and copied to clipboard.`);
    }
  });
}

/**
 * Shows a Windows dialog using PowerShell.
 */
function showWindowsDialog(content: string, fileCount: number, originalQuestion: string, fromWSL: boolean): void {
  const powershellPath = fromWSL 
    ? '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe'
    : 'powershell';
    
  // Create display content with original question
  const displayContent = `=== ORIGINAL QUESTION ===
${originalQuestion}

=== BIG BRAIN FORMATTED CONTENT (${fileCount} files) ===
${content}`;
    
  // Create temp file to avoid command-line length issues
  const tempFile = path.join(os.tmpdir(), `big_brain_${Date.now()}.txt`);
  fs.writeFileSync(tempFile, displayContent);
  
  // Convert WSL path to Windows path if needed
  const windowsPath = fromWSL 
    ? tempFile.replace(/\//g, '\\\\').replace('/mnt/c', 'C:')
    : tempFile.replace(/\//g, '\\\\');
  
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    
    $content = Get-Content -Path '${windowsPath}' -Raw
    
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Big Brain: ${fileCount} files extracted"
    $form.Size = New-Object System.Drawing.Size(1000,600)
    $form.StartPosition = "CenterScreen"
    $form.MaximizeBox = $false
    
    # Create splitter container
    $splitter = New-Object System.Windows.Forms.SplitContainer
    $splitter.Dock = "Fill"
    $splitter.Orientation = "Horizontal"
    $splitter.SplitterDistance = 120
    $splitter.FixedPanel = "Panel1"
    
    # Question panel (top, read-only)
    $questionLabel = New-Object System.Windows.Forms.Label
    $questionLabel.Text = "Original Question:"
    $questionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $questionLabel.Location = New-Object System.Drawing.Point(5,5)
    $questionLabel.Size = New-Object System.Drawing.Size(200,20)
    
    $questionBox = New-Object System.Windows.Forms.TextBox
    $questionBox.Text = "${originalQuestion.replace(/"/g, '""')}"
    $questionBox.Multiline = $true
    $questionBox.ReadOnly = $true
    $questionBox.ScrollBars = "Vertical"
    $questionBox.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $questionBox.BackColor = [System.Drawing.Color]::LightGray
    $questionBox.Location = New-Object System.Drawing.Point(5,25)
    $questionBox.Size = New-Object System.Drawing.Size(970,85)
    
    $splitter.Panel1.Controls.Add($questionLabel)
    $splitter.Panel1.Controls.Add($questionBox)
    
    # Content panel (bottom, editable)
    $contentLabel = New-Object System.Windows.Forms.Label
    $contentLabel.Text = "Big Brain Formatted Content (Select and copy what you need):"
    $contentLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
    $contentLabel.Location = New-Object System.Drawing.Point(5,5)
    $contentLabel.Size = New-Object System.Drawing.Size(400,20)
    
    $textBox = New-Object System.Windows.Forms.RichTextBox
    $textBox.Text = $content
    $textBox.Font = New-Object System.Drawing.Font("Consolas", 9)
    $textBox.ScrollBars = "Both"
    $textBox.ReadOnly = $false
    $textBox.Location = New-Object System.Drawing.Point(5,25)
    $textBox.Size = New-Object System.Drawing.Size(970,410)
    
    $splitter.Panel2.Controls.Add($contentLabel)
    $splitter.Panel2.Controls.Add($textBox)
    
    # Button panel
    $buttonPanel = New-Object System.Windows.Forms.Panel
    $buttonPanel.Height = 40
    $buttonPanel.Dock = "Bottom"
    
    $copyAllButton = New-Object System.Windows.Forms.Button
    $copyAllButton.Text = "Copy All Content"
    $copyAllButton.Size = New-Object System.Drawing.Size(120,30)
    $copyAllButton.Location = New-Object System.Drawing.Point(350,5)
    $copyAllButton.Add_Click({
      [System.Windows.Forms.Clipboard]::SetText($textBox.Text)
      [System.Windows.Forms.MessageBox]::Show("All content copied to clipboard!", "Success")
    })
    
    $copySelectedButton = New-Object System.Windows.Forms.Button
    $copySelectedButton.Text = "Copy Selection"
    $copySelectedButton.Size = New-Object System.Drawing.Size(120,30)
    $copySelectedButton.Location = New-Object System.Drawing.Point(480,5)
    $copySelectedButton.Add_Click({
      if ($textBox.SelectedText -ne "") {
        [System.Windows.Forms.Clipboard]::SetText($textBox.SelectedText)
        [System.Windows.Forms.MessageBox]::Show("Selected text copied to clipboard!", "Success")
      } else {
        [System.Windows.Forms.MessageBox]::Show("No text selected. Please select text first.", "Warning")
      }
    })
    
    $buttonPanel.Controls.Add($copyAllButton)
    $buttonPanel.Controls.Add($copySelectedButton)
    
    $form.Controls.Add($splitter)
    $form.Controls.Add($buttonPanel)
    $form.ShowDialog()
  `;
  
  exec(`${powershellPath} -ExecutionPolicy Bypass -Command "${psScript.replace(/\n/g, ' ')}"`, (error) => {
    if (error) {
      console.error('Windows dialog failed:', error);
    }
  });
}

/**
 * Shows a Linux dialog using zenity, kdialog, or fallback.
 */
function showLinuxDialog(content: string, fileCount: number, originalQuestion: string): void {
  // Create display content with original question
  const displayContent = `=== ORIGINAL QUESTION ===
${originalQuestion}

=== BIG BRAIN FORMATTED CONTENT (${fileCount} files) ===
${content}`;

  // Try zenity first
  exec('which zenity', (error) => {
    if (!error) {
      const tempFile = path.join(os.tmpdir(), `big_brain_${Date.now()}.txt`);
      fs.writeFileSync(tempFile, displayContent);
      exec(`zenity --text-info --filename="${tempFile}" --title="Big Brain: ${fileCount} files" --width=1000 --height=600 --editable`, (error) => {
        if (error) {
          console.error('zenity dialog failed:', error);
        }
      });
    } else {
      // Try kdialog
      exec('which kdialog', (error2) => {
        if (!error2) {
          const tempFile = path.join(os.tmpdir(), `big_brain_${Date.now()}.txt`);
          fs.writeFileSync(tempFile, displayContent);
          exec(`kdialog --textbox "${tempFile}" 1000 600`, (error) => {
            if (error) {
              console.error('kdialog dialog failed:', error);
            }
          });
        } else {
          console.error('No dialog tool found. Install zenity or kdialog for dialog support.');
          // Fallback to clipboard
          clipboardy.write(displayContent).catch(console.error);
        }
      });
    }
  });
}

/**
 * Determines the likely language based on a file extension.
 * @param filePath - Absolute path to the file
 * @returns A string representing the language label (e.g., 'typescript', 'javascript')
 */
function getLanguageFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.jsx':
      return 'javascript';
    case '.json':
      return 'json';
    case '.md':
      return 'markdown';
    default:
      // Fallback to plaintext if not recognized
      return 'plaintext';
  }
}

/**
 * Generates the formatted output for Big Brain from file contents and user instructions.
 * @param fileContents - Array of file data (path, content, language)
 * @param userInstructions - Instructions or questions to ask the Big Brain
 * @returns A single string containing the final output.
 */
const generateFormattedOutput = (fileContents: FileContent[], userInstructions: string): string => {
  // 1) Start the <file_contents> section
  const fileContentsSection = fileContents
    .map(({ path: filePath, content, language }) => {
      // Provide each file with triple backticks and a language hint
      return `
File: ${filePath}
\`\`\`${language}
${content}
\`\`\``;
    })
    .join('\n\n');

  const xmlInstructions = `<xml_formatting_instructions>
### Role
- You are a **code analysis and review assistant**: You analyze code and provide detailed explanations with proposed changes in diff format.
- **IMPORTANT**: Do NOT provide complete file rewrites. Instead, provide targeted diffs and detailed explanations.

### Response Format
Respond with:
1. **Analysis**: Detailed explanation of what you found
2. **Proposed Changes**: Specific diffs showing exactly what to change
3. **Reasoning**: Why these changes are needed and how they solve the problem

### Diff Format Guidelines
Use standard unified diff format for all proposed changes:

\`\`\`diff
--- a/path/to/file.ext
+++ b/path/to/file.ext
@@ -line_start,line_count +line_start,line_count @@
 context line
-line to remove
+line to add
 context line
\`\`\`

### Example Response Structure

## Analysis
[Detailed explanation of what you found in the code, issues identified, patterns observed, etc.]

## Proposed Changes

### File: path/to/file1.ext
**Purpose**: Brief description of what this change accomplishes

\`\`\`diff
--- a/path/to/file1.ext
+++ b/path/to/file1.ext
@@ -10,3 +10,4 @@
 function example() {
-    console.log("old");
+    console.log("new");
+    return true;
 }
\`\`\`

### File: path/to/file2.ext
**Purpose**: Brief description of what this change accomplishes

\`\`\`diff
--- a/path/to/file2.ext
+++ b/path/to/file2.ext
@@ -5,2 +5,3 @@
 const config = {
+    newOption: true,
     existingOption: false
 }
\`\`\`

## Reasoning
[Detailed explanation of:
- Why these specific changes are needed
- How they solve the identified problems
- Any trade-offs or considerations
- Alternative approaches considered
- Impact on other parts of the codebase]

### Guidelines for Diffs
1. **Targeted Changes**: Only show the specific lines that need to change
2. **Context Lines**: Include 2-3 lines of context before and after changes
3. **Clear Markers**: Use proper +/- indicators for additions/removals
4. **Multiple Files**: Create separate diff blocks for each file
5. **Line Numbers**: Use accurate line numbers from the original files
6. **No Placeholders**: Never use "..." or "existing code here" - show actual code

### Special Cases
- **New Files**: Indicate with "new file mode" and show full content
- **Deleted Files**: Indicate with "deleted file mode"
- **Renamed Files**: Show as delete old + create new with explanation

### Important Notes
- Focus on **explaining WHY** changes are needed, not just WHAT to change
- Provide **educational value** by explaining patterns, best practices, and reasoning
- Consider **maintainability**, **performance**, and **readability** in your suggestions
- If multiple approaches are possible, explain the trade-offs
</xml_formatting_instructions>`

  // 2) Provide the user question in an <user_instructions> block
  const user = `<user_instructions>
${userInstructions}
</user_instructions>`;

  // Combine both sections for the final output
  return '<file_contents>'+fileContentsSection+'</file_contents>' + '\n\n' + xmlInstructions + '\n' + user;
};

/**
 * Escapes problematic XML entities from a string.
 * @param unsafe - Input string
 * @returns A string with XML entities escaped
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default:  return c;
    }
  });
};

/**
 * Validates a file path to ensure:
 * 1. It's absolute.
 * 2. The file exists.
 * 3. The extension is allowed (and not blocked).
 * 4. The size is within limits.
 *
 * @param filePath - Must be an absolute path
 * @param cwd - (Unused) Current working directory if needed in the future
 * @throws McpError if validation fails
 * @returns The same file path if valid
 */
const validateFilePath = async (filePath: string, cwd: string): Promise<string> => {
  // Ensure it's an absolute path
  if (!path.isAbsolute(filePath)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `File path must be absolute (e.g., /Users/username/project/src/file.ts). Received: ${filePath}`
    );
  }

  // Check if file exists
  if (!await fs.pathExists(filePath)) {
    throw new McpError(ErrorCode.InvalidParams, `File not found: ${filePath}`);
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();

  // // Check file size
  // const stats = await fs.stat(filePath);
  // if (stats.size > CONFIG.maxFileSize) {
  //   throw new McpError(
  //     ErrorCode.InvalidParams,
  //     `File too large: ${filePath}. Maximum size: ${CONFIG.maxFileSize / 1024 / 1024}MB`
  //   );
  // }

  return filePath;
};

/**
 * Validates the arguments sent to the "ask_big_brain" tool.
 * Ensures that files is a non-empty array of absolute paths, and
 * instructions is a non-empty string.
 *
 * @param args - Raw arguments passed to the tool, possibly JSON or object
 * @throws McpError if validation fails
 * @returns A structured object of type BigBrainArgs
 */
const validateArgs = (args: unknown): BigBrainArgs => {
  try {
    let parsedArgs;

    if (typeof args === 'string') {
      // Find the first occurrence of '{' and the last occurrence of '}'
      const startIndex = args.indexOf('{');
      const endIndex = args.lastIndexOf('}');

      if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        throw new McpError(ErrorCode.InvalidParams, 'Invalid JSON string: no valid object found');
      }

      // Extract the JSON substring and parse it
      const jsonSubstring = args.substring(startIndex, endIndex + 1);
      parsedArgs = JSON.parse(jsonSubstring);
    } else {
      parsedArgs = args;
    }

    const { question } = parsedArgs as Record<string, unknown>;

    // Validate question (required)
    if (typeof question !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'question must be a string');
    }
    if (question.trim().length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'question cannot be empty');
    }

    return {
      question: question.trim()
    };
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid arguments format: ${error.message || 'Unknown error'}`
    );
  }
};

/**
 * Main Big Brain MCP server class.
 * Sets up the necessary request handlers for listing tools and calling "ask_big_brain".
 */
class BigBrainServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'big-brain-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  /**
   * Configures request handlers for listing tools and calling the "ask_big_brain" tool.
   */
  private setupToolHandlers() {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'ask_big_brain',
          description: (
            'Format and prepare complex questions for the Big Brain system using intelligent code extraction. '
            + 'REQUIRES USER INTERACTION: After calling this tool, the user must confirm they '
            + 'have pasted the content to the Big Brain system, then the result is returned. '
            + 'CRITICAL: Your question must be SUPER DETAILED and include: '
            + '1. ALL needed dependencies and context - do not omit anything relevant '
            + '2. ALL specific file paths (absolute paths like /Users/username/project/src/main.rs) - include every file that might be related '
            + '3. ALL specific objects/functions/variables/types in files using # syntax (e.g., main.rs#some_function, app.py#MyClass) - mention every symbol that could be relevant '
            + '4. Clear explanation of what you want to understand or modify '
            + '5. MUST include ALL related files or symbols in the supported format - never skip anything that might be connected to the question '
            + 'The system will automatically extract relevant code using probe based on file paths mentioned in your question. BE COMPREHENSIVE - missing files or symbols will lead to incomplete analysis.'
          ),
          inputSchema: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Super detailed question including ALL file paths, ALL specific functions/objects/variables/types (use # syntax), ALL dependencies, and ALL context needed - be comprehensive and include everything potentially relevant',
              },
            },
            required: ['question'],
          },
        },
      ],
    }));

    // Handler for calling a specific tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      // Validate that the tool name is recognized
      if (request.params.name !== 'ask_big_brain') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Unknown tool requested: ${request.params.name}`
        );
      }

      // Validate and normalize arguments
      const validatedArgs = validateArgs(request.params.arguments);

      try {
        // Create a temporary file with the user's question for probe to parse
        const tempQuestionFile = path.join(os.tmpdir(), `big_brain_question_${Date.now()}.txt`);
        await fs.writeFile(tempQuestionFile, validatedArgs.question, 'utf8');

        let extractedContent: any;
        try {
          // Use probe extract with inputFile to parse file paths from the question and extract relevant code
          // Use json: false to get raw string output and handle JSON parsing ourselves
          extractedContent = await extract({
            inputFile: tempQuestionFile,
            format: 'json',
            json: false,  // Get raw string output to avoid probe's JSON parsing issues
            allowTests: true  // Include test files in extraction
          });
        } catch (probeError: any) {
          const errorDetails = [
            `Error message: ${probeError.message || 'Unknown probe error'}`,
            probeError.stack ? `Stack trace: ${probeError.stack}` : null,
            probeError.stdout ? `Stdout: ${probeError.stdout}` : null,
            probeError.stderr ? `Stderr: ${probeError.stderr}` : null
          ].filter(Boolean).join('\n');
          
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to extract code using probe: ${errorDetails}`
          );
        } finally {
          // Clean up temporary file
          try {
            await fs.unlink(tempQuestionFile);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
        }

        // Parse the JSON response from probe more carefully
        let extractResult: any;
        try {
          if (typeof extractedContent === 'string') {
            // Find the JSON object in the output (skip the "Reading from file..." line)
            const jsonStart = extractedContent.indexOf('{');
            const jsonEnd = extractedContent.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
              const jsonContent = extractedContent.substring(jsonStart, jsonEnd + 1);
              extractResult = JSON.parse(jsonContent);
            } else {
              // Fallback: try parsing the entire content
              extractResult = JSON.parse(extractedContent);
            }
          } else {
            extractResult = extractedContent;
          }
        } catch (parseError: any) {
          // If JSON parsing fails, use the raw content as fallback
          console.error('JSON parsing failed, using raw content as fallback:', parseError.message);
          if (typeof extractedContent === 'string' && extractedContent.trim().length > 0) {
            extractResult = {
              results: [{
                code: extractedContent,
                file: 'raw_probe_output'
              }]
            };
          } else {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to parse probe extract response: ${parseError.message || 'Unknown parse error'}`
            );
          }
        }

        // Convert probe's JSON output to our FileContent format
        const fileContents: FileContent[] = [];
        
        if (extractResult.results && Array.isArray(extractResult.results)) {
          // Handle probe's actual JSON structure with "results" array
          for (const result of extractResult.results) {
            if (result.code && result.file) {
              fileContents.push({
                path: result.file,
                content: result.code,
                language: getLanguageFromExtension(result.file)
              });
            }
          }
        } else if (extractResult.files && Array.isArray(extractResult.files)) {
          // Handle alternative structure if present
          for (const file of extractResult.files) {
            if (file.path && file.content) {
              fileContents.push({
                path: file.path,
                content: file.content,
                language: getLanguageFromExtension(file.path)
              });
            }
          }
        } else if (typeof extractResult === 'string') {
          // Handle case where the entire result is just content
          fileContents.push({
            path: 'extracted_content',
            content: extractResult,
            language: 'text'
          });
        }

        if (fileContents.length === 0) {
          // Include the raw probe output to help debug what files were attempted and why they failed
          const probeOutput = typeof extractedContent === 'string' ? extractedContent : JSON.stringify(extractedContent, null, 2);
          throw new McpError(
            ErrorCode.InvalidParams,
            `No relevant code files found in your question. Please include specific file paths and use # syntax for functions/objects (e.g., main.rs#some_function)\n\nProbe extract output:\n${probeOutput}`
          );
        }

        // Generate the final formatted content
        const formattedContent = generateFormattedOutput(fileContents, validatedArgs.question);

        // Save to configured path
        await fs.writeFile(CONFIG.outputPath, formattedContent, 'utf8');

        const fileCount = fileContents.length;
        
        // Handle output based on configuration (dialog or clipboard) and play sound if enabled
        await handleOutput(formattedContent, fileCount, validatedArgs.question);
        const fileList = fileContents.map(f => `- ${f.path}`).join('\\n');
        
        return {
          content: [
            {
              type: 'text',
              text:
                `Successfully prepared question with ${fileCount} file${fileCount !== 1 ? 's' : ''} using probe extract.\n\n`
                + `Question also saved to file, if clipboard failed: ${CONFIG.outputPath} (do not try by yourself to read this file)\n\n`
                + 'IMPORTANT: This tool requires user interaction:\n\n'
                + '1. The formatted content has been prepared for you.\n'
                + (CONFIG.enableNotify 
                    ? '2. Copy the content from the dialog and paste it into the Big Brain system.\n'
                    : '2. Paste the clipboard content into the Big Brain system.\n')
                + `3. FALLBACK: If clipboard/dialog fails, read content from: ${CONFIG.outputPath} (do not try by yourself to read this file)\n`
                + `4. After obtaining a response from Big Brain, return to the IDE with the response. Always include the path to the question file (${CONFIG.outputPath}) in case clipboard fails.\n\n`
                + "The IDE should now wait for you to complete these steps and provide Big Brain's response."
            },
          ],
        };
      } catch (error: any) {
        const errorCode = error instanceof McpError ? error.code : ErrorCode.InternalError;
        const errorMessage = error?.message || 'Unknown error occurred';
        const fullError =
          `Failed to process question: ${errorMessage}${error.stack ? `\\nStack: ${error.stack}` : ''}`;
        throw new McpError(errorCode, fullError);
      }
    });
  }

  /**
   * Runs the MCP server on stdio.
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Instantiate and run
const server = new BigBrainServer();
server.run().catch(console.error);
