# BigBrain Project Documentation

## Deployment

### Cloudflare Pages Deployment

To deploy the website to Cloudflare Pages and make it available at `https://probeai.dev/big-brain/`:

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

#### 4. Deploy the Worker (for probeai.dev routing)
```bash
npx wrangler deploy
```

This deploys:
- **Pages Site**: Latest version at `https://[hash].big-brain-cyt.pages.dev`
- **Custom Domain**: Available at `https://probeai.dev/big-brain/`

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
- `worker.js` - Cloudflare Worker for probeai.dev routing
- `wrangler.toml` - Cloudflare configuration
- `src/` - MCP server source code
- `package.json` - Node.js dependencies and scripts

## BigBrain Integration

Whenever you get stuck and can't find a solution - just ask BigBrain MCP for advice.