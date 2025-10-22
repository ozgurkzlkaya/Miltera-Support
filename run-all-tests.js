const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Test Suite...\n');

const testCategories = [
  { name: 'Unit Tests', command: 'cd apps/api && npm run test:unit', dir: 'apps/api' },
  { name: 'Integration Tests', command: 'cd apps/api && npm test tests/integration/simple.integration.test.ts', dir: 'apps/api' },
  { name: 'Performance Tests', command: 'cd apps/api && npm test tests/performance/simple.performance.test.ts', dir: 'apps/api' },
  { name: 'Security Tests', command: 'cd apps/api && npm test tests/security/simple.security.test.ts', dir: 'apps/api' },
  { name: 'AI Validation Tests', command: 'cd apps/api && npm test tests/ai-validation/simple.ai.test.ts', dir: 'apps/api' },
  { name: 'Monitoring Tests', command: 'cd apps/api && npm test tests/monitoring/', dir: 'apps/api' },
  { name: 'Frontend Tests', command: 'cd apps/web && npm test tests/simple.test.ts', dir: 'apps/web' },
  { name: 'E2E Tests', command: 'cd apps/web && npm test tests/e2e/simple.e2e.test.ts', dir: 'apps/web' }
];

const results = {
  passed: [],
  failed: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0
};

for (const category of testCategories) {
  console.log(`\n📊 Running ${category.name}...`);
  console.log(`Command: ${category.command}`);
  console.log('─'.repeat(80));
  
  try {
    const output = execSync(category.command, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    console.log(`✅ ${category.name} completed successfully`);
    results.passed.push(category.name);
    
    // Parse test results
    const testMatch = output.match(/Tests:\s+(\d+)\s+passed/);
    if (testMatch) {
      const passed = parseInt(testMatch[1]);
      results.passedTests += passed;
      results.totalTests += passed;
    }
  } catch (error) {
    console.log(`❌ ${category.name} failed`);
    results.failed.push(category.name);
    
    // Try to parse failed tests
    const output = error.stdout || error.stderr || '';
    const failedMatch = output.match(/Tests:\s+(\d+)\s+failed/);
    const passedMatch = output.match(/Tests:\s+(\d+)\s+passed/);
    
    if (failedMatch) {
      results.failedTests += parseInt(failedMatch[1]);
      results.totalTests += parseInt(failedMatch[1]);
    }
    if (passedMatch) {
      results.passedTests += parseInt(passedMatch[1]);
      results.totalTests += parseInt(passedMatch[1]);
    }
  }
}

// Generate final report
console.log('\n' + '='.repeat(80));
console.log('📊 FINAL TEST REPORT');
console.log('='.repeat(80));
console.log(`\n✅ Overall Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(2)}%`);
console.log(`✅ Total Passed: ${results.passedTests}`);
console.log(`❌ Total Failed: ${results.failedTests}`);
console.log(`📊 Total Tests: ${results.totalTests}`);

console.log('\n' + '='.repeat(80));
console.log('Test Results by Category:');
console.log('='.repeat(80));

testCategories.forEach(category => {
  const status = results.passed.includes(category.name) ? '✅' : '❌';
  console.log(`${status} ${category.name}`);
});

console.log('\n' + '='.repeat(80));
console.log('Passed Categories:');
console.log('='.repeat(80));
results.passed.forEach(name => console.log(`✅ ${name}`));

if (results.failed.length > 0) {
  console.log('\n' + '='.repeat(80));
  console.log('Failed Categories:');
  console.log('='.repeat(80));
  results.failed.forEach(name => console.log(`❌ ${name}`));
}

// Save report to file
const reportPath = path.join(process.cwd(), 'FINAL_TEST_EXECUTION_REPORT.md');
const reportContent = `# 🎯 Final Test Execution Report

**Generated:** ${new Date().toLocaleString()}

## 📊 Overall Results

- **Success Rate:** ${((results.passedTests / results.totalTests) * 100).toFixed(2)}%
- **Total Tests:** ${results.totalTests}
- **Passed Tests:** ${results.passedTests}
- **Failed Tests:** ${results.failedTests}

## ✅ Passed Categories (${results.passed.length}/${testCategories.length})

${results.passed.map(name => `- ✅ ${name}`).join('\n')}

${results.failed.length > 0 ? `## ❌ Failed Categories (${results.failed.length}/${testCategories.length})

${results.failed.map(name => `- ❌ ${name}`).join('\n')}` : ''}

## 📈 Test Categories

${testCategories.map(cat => {
  const status = results.passed.includes(cat.name) ? '✅' : '❌';
  return `### ${status} ${cat.name}\n- Command: \`${cat.command}\`\n- Directory: \`${cat.dir}\``;
}).join('\n\n')}

## 🎉 Conclusion

${results.failed.length === 0 
  ? '**All tests passed successfully!** 🎉 The system is production-ready.' 
  : `**${results.failed.length} test categories failed.** Please review and fix the issues.`}
`;

fs.writeFileSync(reportPath, reportContent);
console.log(`\n📄 Report saved to: ${reportPath}`);

console.log('\n' + '='.repeat(80));
console.log('🎉 Test Suite Execution Complete!');
console.log('='.repeat(80));

process.exit(results.failed.length === 0 ? 0 : 1);
