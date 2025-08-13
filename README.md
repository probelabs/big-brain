# Big Brain MCP Server

A Model Context Protocol (MCP) server that formats complex code questions with file context for AI assistants.

## Overview

Big Brain is an MCP server designed to help developers prepare detailed questions for AI coding assistants. It collects multiple source files, formats them with syntax highlighting, and combines them with your instructions in a structured format that's optimized for AI comprehension.

## Features

- **Multi-file context collection**: Include multiple source files in your questions
- **Automatic syntax detection**: Detects language from file extensions for proper formatting
- **Clipboard integration**: Automatically copies formatted output to clipboard
- **Absolute path validation**: Ensures all file paths are absolute for reliability
- **XML-based formatting**: Structures output in a format optimized for AI parsing

## Installation

### As a global npm package

```bash
npm install -g @buger/big-brain
```

### For development

```bash
git clone https://github.com/buger/big-brain.git
cd big-brain
npm install
npm run build
```

## Usage

### With Claude Desktop

Add the server configuration to Claude Desktop:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### Global installation
```json
{
  "mcpServers": {
    "big-brain": {
      "command": "big-brain"
    }
  }
}
```

### Using npx (no installation required)
```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx",
      "args": ["-y", "@buger/big-brain@latest"]
    }
  }
}
```

### Local development
```json
{
  "mcpServers": {
    "big-brain": {
      "command": "/path/to/big-brain/build/index.js"
    }
  }
}
```

### Available Tools

#### `ask_big_brain`

Formats and prepares complex questions with file context.

**Parameters:**
- `files` (array, required): List of absolute file paths to include
- `instructions` (string, required): Your question or instructions for the AI

**Example:**
```json
{
  "files": [
    "/Users/username/project/src/main.ts",
    "/Users/username/project/src/utils.ts"
  ],
  "instructions": "Help me refactor this code to use async/await"
}
```

**Output:**
1. Formatted content is copied to your clipboard
2. Content is saved to a temporary file
3. You can then paste this into your AI assistant

## Development

### Build the project

```bash
npm run build
```

### Watch mode for development

```bash
npm run watch
```

### Testing with MCP Inspector

```bash
npm run inspector
```

The Inspector provides a browser-based interface for testing and debugging the MCP server.

## How It Works

1. **File Collection**: The server validates and reads the specified files
2. **Language Detection**: Automatically detects programming language from file extensions
3. **Formatting**: Wraps code in markdown code blocks with syntax highlighting
4. **XML Structure**: Adds XML formatting instructions for optimal AI parsing
5. **Output**: Copies to clipboard and saves to a temporary file

## Supported File Types

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- JSON (`.json`)
- Markdown (`.md`)
- Other files default to plaintext

## Requirements

- Node.js 16 or higher
- npm or yarn

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/buger/big-brain/issues).