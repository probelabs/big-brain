#!/usr/bin/env node

import { extract } from '@buger/probe';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

async function testProbeSymbol() {
    console.log('Testing Probe with symbol extraction...\n');
    
    // Try both syntaxes
    const questions = [
        "Analyze /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG",
        "Look at CONFIG in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts"
    ];
    
    for (const question of questions) {
        console.log(`\nTesting question: "${question}"`);
        const tempFile = path.join(os.tmpdir(), `test_probe_${Date.now()}.txt`);
        await fs.writeFile(tempFile, question, 'utf8');
        
        try {
            const result = await extract({
                inputFile: tempFile,
                format: 'json',
                json: false,
                allowTests: true
            });
            
            // Parse JSON from output
            const jsonStart = result.indexOf('{');
            const jsonEnd = result.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonContent = result.substring(jsonStart, jsonEnd + 1);
                const parsed = JSON.parse(jsonContent);
                
                if (parsed.results && parsed.results[0]) {
                    const r = parsed.results[0];
                    console.log('  File path returned:', r.file);
                    console.log('  Lines:', r.lines);
                    console.log('  Node type:', r.node_type);
                    console.log('  Code extracted:', r.code?.substring(0, 50) + '...');
                }
            }
        } catch (error) {
            console.error('  Error:', error.message);
        } finally {
            await fs.unlink(tempFile);
        }
    }
}

testProbeSymbol().catch(console.error);