#!/usr/bin/env node

// Test symbol extraction from question
const question = "Please analyze the CONFIG object in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG and the generateFormattedOutput function in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#generateFormattedOutput";

// Match patterns like /path/to/file.ext#symbolName
const symbolPattern = /([\/\w\-\.]+\.\w+)#(\w+)/g;
let match;
const symbolMap = new Map();

while ((match = symbolPattern.exec(question)) !== null) {
    const [full, filePath, symbolName] = match;
    console.log('Found:', { full, filePath, symbolName });
    
    // Check if we already have a symbol for this file
    if (symbolMap.has(filePath)) {
        console.log('  Warning: Multiple symbols for same file. Keeping first.');
    } else {
        symbolMap.set(filePath, symbolName);
    }
}

console.log('\nFinal map:');
for (const [path, symbol] of symbolMap) {
    console.log(`  ${path} -> ${symbol}`);
}