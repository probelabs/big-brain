# BigBrain Project Documentation

## Testing BigBrain

### Testing ChatGPT Mode

The ChatGPT mode allows BigBrain to automatically query ChatGPT Desktop and return responses without manual intervention.

#### Prerequisites
- ChatGPT Desktop app must be installed (https://chatgpt.com/desktop)
- macOS accessibility permissions must be granted to Terminal

#### Running Tests

1. **Test ChatGPT Mode Directly**
```bash
node scripts/tests/test_chatgpt_mode.js
```
This will:
- Start BigBrain with --chatgpt flag
- Send a test question via MCP protocol
- Automatically query ChatGPT Desktop
- Return the response (takes 30-60 seconds)

2. **Test Manual Mode (Default)**
```bash
node scripts/tests/test_mcp_direct.js
```

3. **Test with MCP Inspector**
```bash
npm run inspector -- --chatgpt
```
Then use the web UI to call the ask_big_brain tool.

### Available Command-Line Flags
- `--chatgpt` - Enable automatic ChatGPT Desktop integration
- `--loop <prompt>` - Enable loop mode for multi-agent systems
- `--disable-sound` - Disable sound notifications
- `--disable-notification` - Disable dialog notifications
- `--max-tokens <number>` - Set custom token limit (default: 40000)

### Testing Workflow
1. Build the project: `npm run build`
2. Copy UI reader to build: `cp scripts/chatgpt/chatgpt_ui_reader_ultrafast.js build/`
3. Run test: `node scripts/tests/test_chatgpt_mode.js`

## Deployment

### Cloudflare Pages Deployment

To deploy the website to Cloudflare Pages and make it available at `https://probelabs.com/big-brain/`:

#### 1. Deploy the Site
```bash
npx wrangler pages deploy site/ --project-name big-brain
```

#### 2. Get the Latest Deployment URL
```bash
npx wrangler pages deployment list --project-name big-brain
```
Copy the latest deployment URL (e.g., `https://ea82634b.big-brain-cyt.pages.dev`)

#### 3. Update Worker with Latest URL
Edit `worker.js` line 10 to use the latest deployment URL:
```javascript
const pagesUrl = `https://[latest-hash].big-brain-cyt.pages.dev${newPath}${url.search}`;
```

#### 4. Deploy the Worker (for probelabs.com routing)
```bash
npx wrangler deploy
```

This deploys:
- **Pages Site**: Latest version at `https://[hash].big-brain-cyt.pages.dev`
- **Custom Domain**: Available at `https://probelabs.com/big-brain/`

**Important**: Always update the worker.js with the latest deployment URL, otherwise the custom domain will show outdated content.

#### 5. Automatic GitHub Pages
The site also auto-deploys to GitHub Pages on push to main branch:
- **GitHub Pages**: `https://buger.github.io/big-brain/`

### Development Workflow

1. Make changes to files in `site/` directory
2. Push to main branch (triggers GitHub Pages deployment)
3. Run manual Cloudflare deployment commands above
4. Verify at both URLs

## Project Structure

- `site/` - Website files (HTML, CSS, JS)
- `worker.js` - Cloudflare Worker for probelabs.com routing
- `wrangler.toml` - Cloudflare configuration
- `src/` - MCP server source code
- `scripts/` - Test scripts and utilities
  - `tests/` - All test files
  - `chatgpt/` - ChatGPT Desktop automation scripts
- `package.json` - Node.js dependencies and scripts

## BigBrain Integration

Whenever you get stuck and can't find a solution - just ask BigBrain MCP for advice.