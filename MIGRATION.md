# Package Migration Documentation

## Overview

This document describes the migration of BigBrain MCP Server from `@buger/big-brain` to `@probelabs/big-brain` and the deprecation strategy implemented to ensure seamless user experience.

## Migration Timeline

- **2025-08-15**: Package migrated from `@buger/big-brain` to `@probelabs/big-brain`
- **2025-08-15**: Wrapper + deprecation strategy implemented

## Package Details

### New Package
- **Name**: `@probelabs/big-brain`
- **Repository**: https://github.com/probelabs/big-brain
- **npm**: https://www.npmjs.com/package/@probelabs/big-brain
- **Version**: 0.5.3+

### Legacy Package (Deprecated)
- **Name**: `@buger/big-brain`
- **Status**: DEPRECATED (wrapper package)
- **Latest Version**: 0.5.4 (wrapper)
- **Functionality**: Forwards all calls to `@probelabs/big-brain`

## Migration Strategy

### 1. Wrapper Package Approach

Created a wrapper version of `@buger/big-brain@0.5.4` that:
- Depends on `@probelabs/big-brain@^0.5.3`
- Shows deprecation warnings during execution
- Forwards all functionality to the new package
- Maintains 100% compatibility

### 2. npm Deprecation Notice

Applied deprecation notice to all versions of `@buger/big-brain`:
```bash
npm deprecate @buger/big-brain "This package has moved to @probelabs/big-brain. Please update your dependencies: npm install @probelabs/big-brain"
```

### 3. User Experience

**Installing deprecated package:**
```bash
$ npm install @buger/big-brain
npm WARN deprecated @buger/big-brain@0.5.4: This package has moved to @probelabs/big-brain
```

**Running deprecated package:**
```bash
$ npx @buger/big-brain
⚠️  DEPRECATED: @buger/big-brain has moved to @probelabs/big-brain
📦 Please update your package.json: npm install @probelabs/big-brain
🔗 More info: https://github.com/probelabs/big-brain
```

## Implementation Details

### Wrapper Package Structure
```
wrapper-buger-big-brain/
├── package.json          # Wrapper package configuration
├── build-wrapper.js      # Build script for wrapper
├── build/
│   └── index.js          # Wrapper executable
└── README.md            # Migration instructions
```

### Wrapper Package Configuration
```json
{
  "name": "@buger/big-brain",
  "version": "0.5.4",
  "description": "DEPRECATED: This package has moved to @probelabs/big-brain",
  "dependencies": {
    "@probelabs/big-brain": "^0.5.3"
  }
}
```

### Wrapper Executable
The wrapper script:
1. Shows deprecation warning messages
2. Locates the new package executable
3. Forwards all command-line arguments
4. Maintains exit codes and error handling

## User Migration Guide

### For End Users

**Quick Migration:**
```bash
# Remove old package
npm uninstall @buger/big-brain

# Install new package
npm install @probelabs/big-brain
```

**Claude Code Users:**
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

### For Package Maintainers

If you maintain packages that depend on `@buger/big-brain`:

1. Update your `package.json` dependencies
2. Update documentation and examples
3. Test with the new package
4. Communicate changes to your users

## Benefits of This Approach

### ✅ Advantages
- **Zero breaking changes**: All existing code continues to work
- **Clear migration path**: Users know exactly what to do
- **Gradual migration**: Users can update when convenient
- **Professional handling**: Follows npm best practices
- **Maintains compatibility**: Wrapper ensures functionality

### 🚫 No Disruption
- No immediate action required from users
- No breaking changes to existing installations
- No service interruptions

## Monitoring and Support

### Metrics to Track
- Download counts for both packages
- Migration adoption rate
- User feedback and issues

### Support Channels
- **Issues**: https://github.com/probelabs/big-brain/issues
- **Documentation**: https://github.com/probelabs/big-brain#readme

## Technical Commands Used

### Publishing New Package
```bash
cd /path/to/big-brain
npm run build
npm publish  # Published @probelabs/big-brain@0.5.3
```

### Creating Wrapper
```bash
mkdir wrapper-buger-big-brain
cd wrapper-buger-big-brain
# Created package.json, build-wrapper.js, README.md
npm run build
npm publish  # Published @buger/big-brain@0.5.4 (wrapper)
```

### Adding Deprecation
```bash
npm deprecate @buger/big-brain "This package has moved to @probelabs/big-brain. Please update your dependencies: npm install @probelabs/big-brain"
```

## Future Considerations

### Long-term Maintenance
- The wrapper will be maintained for compatibility
- New features will only be added to `@probelabs/big-brain`
- Consider removing wrapper after significant migration (6-12 months)

### Analytics
- Monitor usage patterns to understand migration progress
- Adjust messaging based on user feedback
- Plan eventual sunset of wrapper package

## Related Files

- `wrapper-buger-big-brain/` - Wrapper package directory
- `package.json` - New package configuration
- `README.md` - Updated with new package references
- `site/index.html` - Website updated with new package references
- `CLAUDE.md` - Deployment documentation

## Success Metrics

✅ **Completed Successfully:**
- New package published: `@probelabs/big-brain@0.5.3`
- Wrapper package published: `@buger/big-brain@0.5.4`
- Deprecation notice applied
- All URLs updated to new GitHub organization
- Website updated with new package references
- Zero breaking changes for existing users

---

*This migration was completed on 2025-08-15 using npm deprecation and wrapper package strategies to ensure seamless user experience.*