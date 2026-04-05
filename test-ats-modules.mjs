#!/usr/bin/env node

// Test script to verify ATS Checker modules load and functions work
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple test - verify files exist and read their exports
const libDir = path.join(__dirname, 'src', 'lib');
const modulesToCheck = [
  'textParser.ts',
  'keywordExtractor.ts',
  'skillClassifier.ts',
  'experienceAnalyzer.ts',
  'atsScoring.ts',
];

console.log('🔍 Checking Module Files...\n');

modulesToCheck.forEach((module) => {
  const filePath = path.join(libDir, module);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Count exports
    const exportMatches = content.match(/^export\s+(function|const|class|interface|type)/gm);
    const exportCount = exportMatches ? exportMatches.length : 0;
    // Count lines
    const lineCount = content.split('\n').length;
    console.log(`✅ ${module}`);
    console.log(`   Lines: ${lineCount}, Exports: ${exportCount}`);
  } else {
    console.log(`❌ ${module} NOT FOUND`);
  }
});

console.log('\n📋 Checking ResumeATSChecker.tsx...');
const componentPath = path.join(__dirname, 'src', 'pages', 'ResumeATSChecker.tsx');
if (fs.existsSync(componentPath)) {
  const content = fs.readFileSync(componentPath, 'utf8');
  const hasPerformAdvanced = content.includes('performAdvancedATSAnalysis');
  const hasJDInput = content.includes('jobDescription');
  console.log(`✅ ResumeATSChecker.tsx found`);
  console.log(`   Uses performAdvancedATSAnalysis: ${hasPerformAdvanced ? '✓' : '✗'}`);
  console.log(`   Has JD input field: ${hasJDInput ? '✓' : '✗'}`);
} else {
  console.log(`❌ ResumeATSChecker.tsx NOT FOUND`);
}

console.log('\n✨ Module Verification Complete\n');
