// client/src/utils/simpleAnalysis.js
export class SimpleCodeAnalyzer {
  static analyze(code, language = 'javascript') {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    
    return {
      complexity: this.calculateComplexity(code),
      warnings: this.findWarnings(code, language),
      metrics: this.calculateMetrics(code),
      suggestions: this.getSuggestions(code, language)
    };
  }

  static calculateComplexity(code) {
    let complexity = 0;
    const patterns = [
      /\bif\s*\(/, /\bfor\s*\(/, /\bwhile\s*\(/, /\bswitch\s*\(/,
      /\bcatch\s*\(/, /\bcase\s+/, /\bdefault\s*:/,
      /\belse\s*{/, /\belse\s+if\s*\(/
    ];
    
    patterns.forEach(pattern => {
      const matches = code.match(new RegExp(pattern.source, 'g'));
      if (matches) complexity += matches.length;
    });
    
    let level = 'low';
    if (complexity > 8) level = 'high';
    else if (complexity > 4) level = 'medium';
    
    return { score: complexity, level };
  }

  static findWarnings(code, language) {
    const warnings = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed.includes('console.log') && !trimmed.startsWith('//')) {
        warnings.push({
          line: index + 1,
          message: 'Remove console.log before production',
          severity: 'warning'
        });
      }
      
      if (trimmed.includes('==') && !trimmed.includes('===') && !trimmed.startsWith('//')) {
        warnings.push({
          line: index + 1,
          message: 'Use === instead of == for strict equality',
          severity: 'warning'
        });
      }
      
      if (trimmed.includes('var ') && !trimmed.startsWith('//')) {
        warnings.push({
          line: index + 1,
          message: 'Use let/const instead of var',
          severity: 'warning'
        });
      }
      
      if (trimmed.includes('eval(') && !trimmed.startsWith('//')) {
        warnings.push({
          line: index + 1,
          message: 'Avoid using eval() for security reasons',
          severity: 'error'
        });
      }
    });
    
    return warnings;
  }

  static getSuggestions(code, language) {
    const suggestions = [];
    
    if (code.includes('function') && !code.includes('arrow') && language === 'javascript') {
      suggestions.push('Consider using arrow functions for better readability');
    }
    
    if (code.split('\n').length > 50) {
      suggestions.push('Consider breaking down into smaller functions');
    }
    
    const complexity = this.calculateComplexity(code);
    if (complexity.level === 'high') {
      suggestions.push('High complexity detected - consider simplifying logic');
    }
    
    return suggestions;
  }

  static calculateMetrics(code) {
    const lines = code.split('\n');
    const totalLines = lines.length;
    const codeLines = lines.filter(line => line.trim().length > 0).length;
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*')
    ).length;
    
    return {
      totalLines,
      codeLines,
      commentLines,
      blankLines: totalLines - codeLines,
      commentRatio: commentLines / Math.max(codeLines, 1)
    };
  }
}