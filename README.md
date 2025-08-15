# BigBrain MCP Server

When your AI needs a bigger brain.

## Overview

BigBrain is an MCP server that gives your AI an elegant exit when it gets stuck, loops, or loses context. It intelligently extracts relevant code and context, packages it cleanly, and enables you to get fresh insights from external AI models like ChatGPT 5 Pro, Grok Heavy, or Claude Opus - then return with the solution to your original chat.

## Features

- **Intelligent Context Extraction**: Uses Probe to automatically discover and extract relevant code, dependencies, and context
- **Round-Trip Workflow**: Get external AI advice and return to your original chat with fresh insights
- **Clean Context Packaging**: Formats everything into minimal, paste-ready prompt packs
- **Clipboard Integration**: Automatically copies formatted output to clipboard for seamless workflow
- **Multi-Model Support**: Works with any AI but optimized for advanced models like ChatGPT 5 Pro, Grok Heavy, and Claude Opus
- **Configurable Notifications**: Optional sound and desktop notifications (can be disabled with flags)

## Installation

### Claude Code (Recommended)
```bash
claude mcp add -- npx -y @probelabs/big-brain@latest
```

### Cursor & Other MCP Clients
Add to your MCP configuration file:
```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx",
      "args": ["-y", "@probelabs/big-brain@latest"]
    }
  }
}
```

## Quick Start

### 1. Ask AI to use BigBrain

When your AI gets stuck, loops, or loses context:

```
Ask BigBrain to help me with this React component issue
```

### 2. Get External Advice

BigBrain extracts code and copies everything to clipboard. Open fresh AI chat, paste, and get the solution.

### 3. Return with Solution

Copy the external AI's response and return to your original chat. Paste the solution to continue with fresh insights.

## Configuration Options

### Disable Notifications

If you prefer silent operation, you can disable sound and desktop notifications:

```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx",
      "args": ["-y", "@probelabs/big-brain@latest", "--disable-sound", "--disable-notification"]
    }
  }
}
```

**Available Flags:**
- `--disable-sound`: Disable sound notifications
- `--disable-notification`: Disable desktop notifications

## How BigBrain Works

### The Round-Trip Process

1. **AI Preparation**: Your AI prepares a comprehensive question with all needed context and details
2. **Intelligent Extraction**: BigBrain uses Probe to automatically scan and extract relevant code, dependencies, and context
3. **Clean Packaging**: Everything is formatted into a minimal, paste-ready prompt pack and copied to your clipboard
4. **External Consultation**: You paste the context pack into a fresh AI chat (ChatGPT 5 Pro, Grok Heavy, Claude Opus, etc.) to get analysis and solutions
5. **Return Journey**: Copy the external AI's response and paste it back into your original chat to continue with fresh insights

### Why This Works

- **Breaks Context Loops**: Fresh AI session without chat history noise
- **Leverages Advanced Models**: Use the best AI for complex analysis
- **Maintains Workflow**: Return to your original work with solutions
- **Intelligent Context**: Probe ensures all relevant code is included automatically

## Optional: Automate BigBrain Usage

Add this to your `CLAUDE.md` file so your AI automatically knows when to use BigBrain:

```markdown
# BigBrain Integration
Whenever you get stuck and can't find a solution - just ask BigBrain MCP for advice.
```

## Development

### Local Development Setup

```bash
git clone https://github.com/probelabs/big-brain.git
cd big-brain
npm install
npm run build
```

### Development Commands

```bash
npm run build        # Build the project
npm run watch        # Watch mode for development
npm run inspector    # Test with MCP Inspector
```

The MCP Inspector provides a browser-based interface for testing and debugging the server.

### Requirements

- Node.js 16 or higher
- npm or yarn

## Technical Details

### Built on Probe

BigBrain leverages [Probe](https://probeai.dev/) for intelligent code extraction. When your AI mentions specific files or functions, Probe automatically discovers and includes all related dependencies, types, and context - no manual file specification required.

### Supported File Types

BigBrain works with all common programming languages and file types:
- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Python (`.py`)
- Rust (`.rs`)
- Go (`.go`)
- JSON (`.json`)
- Markdown (`.md`)
- And many more...

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/probelabs/big-brain/issues).