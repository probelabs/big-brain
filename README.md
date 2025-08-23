# BigBrain MCP Server

[![npm version](https://badge.fury.io/js/@probelabs%2Fbig-brain.svg)](https://www.npmjs.com/package/@probelabs/big-brain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)](https://github.com/anthropics/model-context-protocol)

When your AI needs a bigger brain.

## Overview

BigBrain is an MCP server that gives your AI an elegant exit when it gets stuck, loops, or loses context. It intelligently extracts relevant code and context, packages it cleanly, and operates in three modes:

- **External AI Mode**: Get fresh insights from external AI models like ChatGPT 5 Pro, Grok Heavy, or Claude Opus - then return with the solution to your original chat
- **Multi-Agent Mode**: Enable seamless AI-to-AI communication within systems like Claude Code for direct agent collaboration
- **ChatGPT Desktop Mode** (Experimental): Fully automated Agent-to-Agent communication with ChatGPT Desktop app (macOS only)

## Features

- **Intelligent Context Extraction**: Uses Probe to automatically discover and extract relevant code, dependencies, and context
- **Three Operation Modes**: 
  - **External AI Mode**: Round-trip workflow with clipboard integration for user-driven external consultation
  - **Multi-Agent Mode**: Direct AI-to-AI communication for automated agent collaboration
  - **ChatGPT Desktop Mode**: Native integration with ChatGPT Desktop for Agent-to-Agent workflows (macOS)
- **Clean Context Packaging**: Formats everything into minimal, structured prompt packs
- **Multi-Model Support**: Works with any AI but optimized for advanced models like ChatGPT 5 Pro, Grok Heavy, and Claude Opus
- **File-Based Communication**: Reliable agent-to-agent transfer in multi-agent systems
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

## Usage Modes

BigBrain operates in three distinct modes depending on your workflow needs:

### External AI Mode (Default)

For **manual consultation** with external AI models:

```bash
# Standard installation uses External AI Mode
claude mcp add -- npx -y @probelabs/big-brain@latest
```

**Workflow:**
1. Ask your AI to use BigBrain when stuck
2. BigBrain extracts code and copies to clipboard 
3. Paste into external AI (ChatGPT 5 Pro, Grok Heavy, Claude Opus)
4. Return with solution to original chat

### Multi-Agent Mode

For **automated AI-to-AI communication** in systems like Claude Code:

```bash
# Enable loop mode with custom agent prompt
npx @probelabs/big-brain --loop "Now call research-agent to investigate this issue"
```

**Workflow:**
1. AI uses BigBrain with `--loop` flag and custom prompt
2. BigBrain extracts code and saves to file (no clipboard)
3. Returns instructions for the next agent to read the file
4. Seamless automated agent collaboration

### ChatGPT Desktop Mode (Experimental)

For **fully automated Agent-to-Agent communication** with ChatGPT Desktop:

```bash
# Enable ChatGPT Desktop integration
claude mcp add -- npx -y @probelabs/big-brain@latest --chatgpt
```

**Requirements:**
- macOS 11.0 or later
- [ChatGPT Desktop app](https://chatgpt.com/desktop) installed
- Terminal accessibility permissions enabled (System Settings → Privacy & Security → Accessibility)

**Workflow:**
1. Your AI agent calls BigBrain when it needs help
2. BigBrain automatically opens ChatGPT Desktop app
3. Sends the query and waits for response (30 seconds to 20 minutes for ChatGPT Pro thinking)
4. Returns ChatGPT's response back to your agent
5. Fully automated - no manual intervention required

**Optimized for ChatGPT 5 Pro:** This mode is specifically designed to leverage ChatGPT 5 Pro's advanced thinking capabilities for complex reasoning tasks.

## When to Use Each Mode

| Scenario | Mode | Why |
|----------|------|-----|
| Stuck on complex debugging | **External AI** | Get fresh human-guided analysis from advanced models |
| Need specialized expertise | **External AI** | Leverage specific model strengths (GPT-5 Pro, Grok Heavy, etc.) |
| Multi-agent workflows | **Multi-Agent** | Automated collaboration between AI agents |
| Claude Code environments | **Multi-Agent** | Direct agent-to-agent handoffs |
| Need ChatGPT 5 Pro thinking | **ChatGPT Desktop** | Automated access to ChatGPT's advanced reasoning |
| macOS with ChatGPT Desktop | **ChatGPT Desktop** | Native integration for seamless Agent-to-Agent flow |
| Manual consultation | **External AI** | Human-in-the-loop decision making |
| Automated pipelines | **Multi-Agent** | No human intervention required |

## Quick Start

### External AI Mode

#### 1. Ask AI to use BigBrain
When your AI gets stuck, loops, or loses context:
```
Ask BigBrain to help me with this React component issue
```

#### 2. Get External Advice
BigBrain extracts code and copies everything to clipboard. Open fresh AI chat, paste, and get the solution.

#### 3. Return with Solution
Copy the external AI's response and return to your original chat. Paste the solution to continue with fresh insights.

### Multi-Agent Mode

#### 1. AI Initiates with Loop Flag
Your AI system uses BigBrain with a custom agent prompt:
```
AI calls: bigbrain --loop "Now call research-agent to investigate this issue"
```

#### 2. Direct Agent Communication
BigBrain responds with file path and instructions for the next agent to read and process the context.

#### 3. Automated Continuation
The designated agent reads the file and continues the workflow without human intervention.

## Configuration Options

### Available Flags

BigBrain supports several command-line flags to customize behavior:

```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx",
      "args": [
        "-y", "@probelabs/big-brain@latest",
        "--disable-sound",
        "--disable-notification"
      ]
    }
  }
}
```

**Flag Reference:**
- `--chatgpt`: Enable ChatGPT Desktop mode (macOS only, experimental)
- `--loop "custom prompt"`: Enable multi-agent mode with custom agent instruction
- `--disable-sound`: Disable sound notifications
- `--disable-notification`: Disable desktop notifications

### Multi-Agent Configuration Example

For systems like Claude Code that need automated agent communication:

```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx", 
      "args": [
        "-y", "@probelabs/big-brain@latest",
        "--loop", "Now call research-agent to investigate this issue",
        "--disable-sound",
        "--disable-notification"
      ]
    }
  }
}
```

### ChatGPT Desktop Configuration Example

For macOS users with ChatGPT Desktop app installed:

```json
{
  "mcpServers": {
    "big-brain": {
      "command": "npx",
      "args": [
        "-y", "@probelabs/big-brain@latest",
        "--chatgpt",
        "--disable-sound"
      ]
    }
  }
}
```

## How BigBrain Works

### External AI Mode Process

1. **AI Preparation**: Your AI prepares a comprehensive question with all needed context and details
2. **Intelligent Extraction**: BigBrain uses Probe to automatically scan and extract relevant code, dependencies, and context
3. **Clean Packaging**: Everything is formatted into a minimal, paste-ready prompt pack and copied to your clipboard
4. **External Consultation**: You paste the context pack into a fresh AI chat (ChatGPT 5 Pro, Grok Heavy, Claude Opus, etc.) to get analysis and solutions
5. **Return Journey**: Copy the external AI's response and paste it back into your original chat to continue with fresh insights

### Multi-Agent Mode Process

1. **Agent Initiation**: AI system calls BigBrain with `--loop` flag and custom agent prompt
2. **Intelligent Extraction**: BigBrain uses Probe to automatically extract relevant code and context
3. **File-Based Packaging**: Context is saved to a temporary file in structured XML format
4. **Agent Instruction**: BigBrain responds with the custom prompt and file path for the next agent
5. **Direct Handoff**: The designated agent reads the file and continues processing without human intervention

### ChatGPT Desktop Mode Process

1. **Agent Request**: Your AI agent calls BigBrain when it encounters a complex problem
2. **Intelligent Extraction**: BigBrain uses Probe to extract relevant code and context
3. **Automated UI Control**: BigBrain opens ChatGPT Desktop app via macOS accessibility APIs
4. **Query Submission**: Automatically types or pastes the query into ChatGPT
5. **Response Capture**: Waits for and captures ChatGPT's response (optimized for thinking models)
6. **Agent Return**: Returns the response directly to your AI agent

### Why All Modes Work

**External AI Mode Benefits:**
- **Breaks Context Loops**: Fresh AI session without chat history noise
- **Leverages Advanced Models**: Use the best AI for complex analysis
- **Human Oversight**: Manual control over consultation process
- **Model Flexibility**: Choose the right AI for each specific problem

**Multi-Agent Mode Benefits:**
- **Automated Workflows**: No human intervention required
- **Reliable Transfer**: File-based communication eliminates clipboard dependencies
- **Agent Coordination**: Custom prompts guide specific agent actions
- **Seamless Integration**: Built for systems like Claude Code with multiple AI agents

**ChatGPT Desktop Mode Benefits:**
- **Native Integration**: Direct control of ChatGPT Desktop app
- **Thinking Models**: Optimized for ChatGPT 5 Pro's advanced reasoning
- **Fully Automated**: Agent-to-Agent without human intervention
- **macOS Native**: Leverages system accessibility for seamless control

**Shared Benefits:**
- **Intelligent Context**: Probe ensures all relevant code is included automatically
- **Clean Separation**: Focused context without noise
- **Maintains Workflow**: Continue original work with fresh insights

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