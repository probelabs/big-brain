#!/usr/bin/env node

import { extract } from '@buger/probe';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

async function testProbeExtract() {
    console.log('Testing Probe extract directly...\n');
    
    // Create a test question file
    const question = "Please analyze the CONFIG object in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#CONFIG and the generateFormattedOutput function in /Users/leonidbugaev/Documents/Cline/MCP/big-brain/src/index.ts#generateFormattedOutput";
    
    const tempFile = path.join(os.tmpdir(), `test_probe_${Date.now()}.txt`);
    await fs.writeFile(tempFile, question, 'utf8');
    
    try {
        console.log('Calling probe extract with:');
        console.log('- inputFile:', tempFile);
        console.log('- format: json');
        console.log('- json: false\n');
        
        const result = await extract({
            inputFile: tempFile,
            format: 'json',
            json: false,
            allowTests: true
        });
        
        console.log('Raw Probe output:');
        console.log('=================');
        console.log(result);
        console.log('=================\n');
        
        // Try to parse the JSON
        const jsonStart = result.indexOf('{');
        const jsonEnd = result.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonContent = result.substring(jsonStart, jsonEnd + 1);
            const parsed = JSON.parse(jsonContent);
            
            console.log('Parsed JSON structure:');
            console.log('Results count:', parsed.results?.length || 0);
            
            if (parsed.results) {
                parsed.results.forEach((r, i) => {
                    console.log(`\nResult ${i + 1}:`);
                    console.log('  File:', r.file);
                    console.log('  Code length:', r.code?.length || 0);
                    console.log('  Code preview:', r.code?.substring(0, 100) + '...');
                    
                    // Check for any other fields
                    const otherFields = Object.keys(r).filter(k => k !== 'file' && k !== 'code');
                    if (otherFields.length > 0) {
                        console.log('  Other fields:', otherFields);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await fs.unlink(tempFile);
    }
}

testProbeExtract().catch(console.error);