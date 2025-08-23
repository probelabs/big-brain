# Contributing to BigBrain

We love your input! We want to make contributing to BigBrain as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests in `scripts/tests/`
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing style
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the CLAUDE.md if you're changing testing procedures
3. The PR will be merged once you have the sign-off of at least one maintainer

## Local Development

```bash
# Clone the repository
git clone https://github.com/probelabs/big-brain.git
cd big-brain

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
node scripts/tests/test_mcp_direct.js

# Test with MCP Inspector
npm run inspector
```

## Testing

Before submitting a PR, ensure all tests pass:

```bash
# Test token counting
node scripts/tests/test_all_cases.js

# Test MCP functionality
node scripts/tests/test_mcp_direct.js

# Test ChatGPT mode (macOS only)
node scripts/tests/test_chatgpt_mode.js
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (2 spaces, no semicolons in TypeScript)
- Add JSDoc comments for public APIs
- Keep functions focused and small
- Use meaningful variable and function names

## Commit Messages

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only changes
- `style:` Changes that don't affect code meaning
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding missing tests
- `chore:` Changes to build process or auxiliary tools

## Any contributions you make will be under the MIT Software License

When you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project.

## Report bugs using GitHub's [issue tracker](https://github.com/probelabs/big-brain/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/probelabs/big-brain/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/main/CONTRIBUTING.md)