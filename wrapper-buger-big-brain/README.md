# ⚠️ DEPRECATED: @buger/big-brain

**This package has moved to [@probelabs/big-brain](https://www.npmjs.com/package/@probelabs/big-brain)**

## 🚀 Migration Guide

### Quick Migration
```bash
# Remove old package
npm uninstall @buger/big-brain

# Install new package  
npm install @probelabs/big-brain
```

### Update Your Code

**Claude Code:**
```bash
# Old
claude mcp add -- npx -y @buger/big-brain@latest

# New  
claude mcp add -- npx -y @probelabs/big-brain@latest
```

**MCP Configuration:**
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

## Why the Move?

This package has been moved to the [@probelabs](https://www.npmjs.com/org/probelabs) organization to better reflect the project's integration with the [Probe](https://probeai.dev) ecosystem.

## 🔄 Compatibility

This wrapper package will continue to work and forward all calls to `@probelabs/big-brain`, but we strongly recommend updating to the new package for:

- Better long-term support
- Access to latest features  
- Cleaner dependency management

## 📚 Documentation

- **New Repository**: https://github.com/probelabs/big-brain
- **Documentation**: https://github.com/probelabs/big-brain#readme
- **Issues**: https://github.com/probelabs/big-brain/issues

## ⏰ Timeline

- This wrapper will be maintained for compatibility
- New features will only be added to `@probelabs/big-brain`
- Please migrate at your convenience

---

**Need help with migration?** [Open an issue](https://github.com/probelabs/big-brain/issues)