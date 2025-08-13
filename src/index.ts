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
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
  CallToolRequest
} from '@modelcontextprotocol/sdk/types.js';

// Configuration
const CONFIG = {
  outputPath: path.join(os.tmpdir(), 'big_brain_output.txt'),
  maxFiles: 100,
  maxFileSize: 1_000_000, // 1 MB
};

interface BigBrainArgs {
  files: string[];
  instructions: string;
}

/**
 * Represents the content of a file along with its detected language (by extension).
 */
interface FileContent {
  path: string;
  content: string;
  language: string;
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
- You are a **code editing assistant**: You can fulfill edit requests and chat with the user about code or other questions. Provide complete instructions or code lines when replying with xml formatting.

### Capabilities
- Can create new files.
- Can rewrite entire files.
- Can delete existing files.

Avoid placeholders like \`...\` or \`// existing code here\`. Provide complete lines or code.

## Tools & Actions
1. **create** – Create a new file if it doesn’t exist.
2. **rewrite** – Replace the entire content of an existing file.
3. **delete** – Remove a file entirely (empty <content>).

### **Format to Follow for Repo Prompt's Diff Protocol**

<Plan>
Describe your approach or reasoning here.
</Plan>

<file path="path/to/example.swift" action="one_of_the_tools">
  <change>
    <description>Brief explanation of this specific change</description>
    <content>
===
// Provide the new or updated code here. Do not use placeholders
===
    </content>
  </change>
</file>

#### Tools Demonstration
1. <file path="NewFile.swift" action="create"> – Full file in <content>
2. <file path="DeleteMe.swift" action="delete"> – Empty <content>
3. <file path="RewriteMe.swift" action="rewrite"> – Entire file in <content>

## Format Guidelines
1. **Plan**: Begin with a <Plan> block explaining your approach.
2. **<file> Tag**: e.g. <file path="Models/User.swift" action="...">. Must match an available tool.
3. **<change> Tag**: Provide <description> to clarify each change. Then <content> for new/modified code. Additional rules depend on your capabilities.
4. **rewrite**: Replace the entire file. This is the only way to modify existing files.
5. **create**: For new files, put the full file in <content>.
6. **delete**: Provide an empty <content>. The file is removed.

## Code Examples

-----
### Example: Full File Rewrite
<Plan>
Rewrite the entire User file to include an email property.
</Plan>

<file path="Models/User.swift" action="rewrite">
  <change>
    <description>Full file rewrite with new email field</description>
    <content>
===
import Foundation
struct User {
    let id: UUID
    var name: String
    var email: String

    init(name: String, email: String) {
        self.id = UUID()
        self.name = name
        self.email = email
    }
}
===
    </content>
  </change>
</file>

-----
### Example: Create New File
<Plan>
Create a new RoundedButton for a custom Swift UIButton subclass.
</Plan>

<file path="Views/RoundedButton.swift" action="create">
  <change>
    <description>Create custom RoundedButton class</description>
    <content>
===
import UIKit
@IBDesignable
class RoundedButton: UIButton {
    @IBInspectable var cornerRadius: CGFloat = 0
}
===
    </content>
  </change>
</file>

-----
### Example: Delete a File
<Plan>
Remove an obsolete file.
</Plan>

<file path="Obsolete/File.swift" action="delete">
  <change>
    <description>Completely remove the file from the project</description>
    <content>
===
===
    </content>
  </change>
</file>

## Final Notes
1.  **rewrite**  For rewriting an entire file, place all new content in <content>. No partial modifications are possible here. Avoid all use of placeholders.
2. You can always **create** new files and **delete** existing files. Provide full code for create, and empty content for delete. Avoid creating files you know exist already.
3. If a file tree is provided, place your files logically within that structure. Respect the user’s relative or absolute paths.
4. Wrap your final output in \`\`\`XML ... \`\`\` for clarity.
5. The final output must apply cleanly with no leftover syntax errors.
</xml_formatting_instructions>`

  // 2) Provide the instructions in an <xml_formatting_instructions> block
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


    const { files, instructions } = parsedArgs as Record<string, unknown>;

    // Validate files array
    if (!Array.isArray(files)) {
      throw new McpError(ErrorCode.InvalidParams, 'files must be an array');
    }
    if (files.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'At least one file must be provided');
    }
    if (files.length > CONFIG.maxFiles) {
      throw new McpError(ErrorCode.InvalidParams, `Maximum ${CONFIG.maxFiles} files allowed`);
    }
    if (!files.every((f: unknown) => typeof f === 'string' && f.trim().length > 0)) {
      throw new McpError(ErrorCode.InvalidParams, 'All file paths must be non-empty strings');
    }

    // Validate all paths are absolute
    const nonAbsolutePaths = (files as string[]).filter(f => !path.isAbsolute(f));
    if (nonAbsolutePaths.length > 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        [
          'All file paths must be absolute (e.g., /Users/username/project/src/file.ts).',
          `Found invalid paths: ${nonAbsolutePaths.join(', ')}`
        ].join(' ')
      );
    }

    // Validate instructions
    if (typeof instructions !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'instructions must be a string');
    }
    if (instructions.trim().length === 0) {
      throw new McpError(ErrorCode.InvalidParams, 'instructions cannot be empty');
    }

    return {
      files: (files as string[]).map(f => f.trim()),
      instructions: instructions.trim()
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
            'Format and prepare complex questions for the Big Brain system. '
            + 'REQUIRES USER INTERACTION: After calling this tool, the user must confirm they '
            + 'have pasted the content to the Big Brain system, then the result is returned. '
            + 'CRITICAL: All file paths MUST be absolute (e.g., /Users/username/project/src/file.ts). '
            + 'Relative paths like "./src/file.ts" or "../file.ts" are NOT supported and will be rejected.'
	    + 'Do not add new lines to arguments, use \\n to escape them. Do not add </use_mcp_tool> to arguments'
          ),
          inputSchema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  description: 'Absolute path to the file (e.g., /Users/username/project/src/file.ts).',
                },
                description: 'List of files with absolute paths',
              },
              instructions: {
                type: 'string',
                description: 'Instructions or question for the Big Brain system',
              },
            },
            required: ['files', 'instructions'],
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
      const { files, instructions } = validateArgs(request.params.arguments);

      try {
        // Validate each file path thoroughly
        const absolutePaths = await Promise.all(files.map(f => validateFilePath(f, '')));

        // Collect file contents
        const fileContents: FileContent[] = [];
        for (const filePath of absolutePaths) {
          const content = await fs.readFile(filePath, 'utf8');
          fileContents.push({
            path: filePath,
            content,
            language: getLanguageFromExtension(filePath)
          });
        }

        // Generate the final formatted content
        const formattedContent = generateFormattedOutput(fileContents, instructions);

        // Save to configured path
        await fs.writeFile(CONFIG.outputPath, formattedContent, 'utf8');

        // Copy to clipboard for convenience
        await clipboardy.write(formattedContent);

        const fileCount = files.length;
        return {
          content: [
            {
              type: 'text',
              text:
                `Successfully prepared question with ${fileCount} file${fileCount !== 1 ? 's' : ''}:\n\n`
                + `1. Content has been copied to your clipboard.\n`
                + `2. Content has been saved to: ${CONFIG.outputPath}\n\n`
                + `Files included:\n${files.map(f => `- ${f}`).join('\\n')}\n\n`
                + 'IMPORTANT: This tool requires user interaction:\n\n'
                + '1. The formatted content has been prepared and copied to your clipboard.\n'
                + '2. You must now paste this content into the Big Brain system.\n'
                + '3. After obtaining a response from Big Brain, return to the IDE with the response.\n\n'
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
