#!/usr/bin/env node

// Test the updated XML format with renamed tags
const question = "Please analyze the CONFIG object in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG";

// Simulate the formatted output
const generateTestOutput = () => {
  const codeSection = `  <symbol path="/Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts" name="CONFIG" language="typescript" type="object_declaration" start-line="10" end-line="20">
const CONFIG = {
  outputPath: '/tmp/big_brain_output.txt',
  enableNotify: true,
  loopPrompt: null
};
  </symbol>`;

  const roleInstructions = `<role>
### Understanding the Code Context
The <code> section above contains extracted code in two formats:
- **<file>** tags: Complete file contents for full context
  - Attributes: path (file location), language (code language), type (node type), start-line/end-line (line numbers if partial)
- **<symbol>** tags: Specific functions, classes, or code fragments that were explicitly referenced
  - Attributes: path (file location), name (symbol name), type (node type), language, start-line/end-line (line numbers)

### Role
- You are a **code analysis and review assistant**: You analyze code and provide detailed explanations with proposed changes in diff format.
- **IMPORTANT**: Do NOT provide complete file rewrites. Instead, provide targeted diffs and detailed explanations.
- **Focus on symbols**: When <symbol> tags are present, pay special attention to those specific code fragments
- **Follow-up Questions**: If you need additional code context or clarification:
  - For missing code/files: Ask specifically which files, functions, or symbols you need (use # syntax)
  - For user clarification: Ask clear, specific questions about requirements or expected behavior
  - Distinguish between needing more data (code) vs needing user input (requirements)

### Response Format
Respond with:
1. **Analysis**: Detailed explanation of what you found
2. **Proposed Changes**: Specific diffs showing exactly what to change
3. **Reasoning**: Why these changes are needed and how they solve the problem
</role>`;

  const taskBlock = `<task>
${question}
</task>`;

  return '<code>\n' + codeSection + '\n</code>\n\n' + roleInstructions + '\n' + taskBlock;
};

const output = generateTestOutput();
console.log('Generated output with updated tags:\n');
console.log(output);
console.log('\n\n✅ Tags renamed:');
console.log('  - <xml_formatting_instructions> → <role>');
console.log('  - <user_instructions> → <task>');
console.log('\n✅ Role section enhanced with follow-up question instructions');