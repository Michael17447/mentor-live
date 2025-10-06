// client/src/utils/simpleAnalysis.js
export class SimpleCodeAnalyzer {
  static analyze(code, language = 'javascript') {
    if (!code || code.trim().length === 0) {
      return {
        complexity: { score: 0, level: 'low' },
        warnings: [],
        metrics: { totalLines: 0, codeLines: 0, commentLines: 0, blankLines: 0, commentRatio: 0 },
        suggestions: [],
        timestamp: new Date().toISOString()
      };
    }

    const lines = code.split('\n');
    
    return {
      complexity: this.calculateComplexity(code, language),
      warnings: this.findWarnings(code, language),
      metrics: this.calculateMetrics(code),
      suggestions: this.getSuggestions(code, language),
      timestamp: new Date().toISOString()
    };
  }

  static calculateComplexity(code, language) {
    let complexity = 0;
    let patterns = [];

    // Языко-специфичные паттерны для сложности
    switch (language) {
      case 'javascript':
      case 'typescript':
        patterns = [
          /\bif\s*\(/, /\bfor\s*\(/, /\bwhile\s*\(/, /\bswitch\s*\(/,
          /\bcatch\s*\(/, /\bcase\s+/, /\bdefault\s*:/,
          /\belse\s*{/, /\belse\s+if\s*\(/, /\bfunction\s+\w+\s*\(/,
          /=>\s*{/, /\btry\s*{/
        ];
        break;
      case 'python':
        patterns = [
          /\bif\s+/, /\bfor\s+/, /\bwhile\s+/, /\btry\s*:/,
          /\bexcept\s+/, /\bdef\s+\w+\s*\(/, /lambda\s+/,
          /\belif\s+/, /\belse\s*:/
        ];
        break;
      case 'java':
      case 'cpp':
      case 'csharp':
        patterns = [
          /\bif\s*\(/, /\bfor\s*\(/, /\bwhile\s*\(/, /\bswitch\s*\(/,
          /\bcatch\s*\(/, /\bcase\s+/, /\bdefault\s*:/,
          /\belse\s*{/, /\belse\s+if\s*\(/, /\bpublic\s+\w+\s+\w+\s*\(/,
          /\bprivate\s+\w+\s+\w+\s*\(/, /\bprotected\s+\w+\s+\w+\s*\(/,
          /\btry\s*{/
        ];
        break;
      default:
        patterns = [
          /\bif\s*\(/, /\bfor\s*\(/, /\bwhile\s*\(/, /\bswitch\s*\(/,
          /\bcatch\s*\(/, /\bcase\s+/, /\bdefault\s*:/,
          /\belse\s*{/, /\belse\s+if\s*\(/
        ];
    }
    
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
      const lineNumber = index + 1;
      
      // Общие проверки для всех языков
      if (trimmed.includes('TODO:') || trimmed.includes('FIXME:')) {
        warnings.push({
          line: lineNumber,
          message: 'TODO/FIXME comment found',
          severity: 'info'
        });
      }
      
      // Проверки для JavaScript/TypeScript
      if (['javascript', 'typescript'].includes(language)) {
        if (trimmed.includes('console.log') && !trimmed.startsWith('//')) {
          warnings.push({
            line: lineNumber,
            message: 'Remove console.log before production',
            severity: 'warning'
          });
        }
        
        if (trimmed.includes('==') && !trimmed.includes('===') && !trimmed.startsWith('//')) {
          warnings.push({
            line: lineNumber,
            message: 'Use === instead of == for strict equality',
            severity: 'warning'
          });
        }
        
        if (trimmed.includes('var ') && !trimmed.startsWith('//')) {
          warnings.push({
            line: lineNumber,
            message: 'Use let/const instead of var',
            severity: 'warning'
          });
        }
        
        if (trimmed.includes('eval(') && !trimmed.startsWith('//')) {
          warnings.push({
            line: lineNumber,
            message: 'Avoid using eval() for security reasons',
            severity: 'error'
          });
        }

        if (trimmed.includes('.innerHTML') && !trimmed.startsWith('//')) {
          warnings.push({
            line: lineNumber,
            message: 'Consider using textContent instead of innerHTML for security',
            severity: 'warning'
          });
        }
      }

      // Проверки для Python
      if (language === 'python') {
        if (trimmed.includes('print(') && !trimmed.startsWith('#')) {
          warnings.push({
            line: lineNumber,
            message: 'Consider using logging instead of print for production',
            severity: 'warning'
          });
        }

        if (trimmed.includes('import *')) {
          warnings.push({
            line: lineNumber,
            message: 'Avoid wildcard imports for better code clarity',
            severity: 'warning'
          });
        }
      }

      // Проверки для Java
      if (language === 'java') {
        if (trimmed.includes('System.out.print')) {
          warnings.push({
            line: lineNumber,
            message: 'Consider using Logger instead of System.out',
            severity: 'warning'
          });
        }
      }
    });
    
    return warnings;
  }

  static getSuggestions(code, language) {
    const suggestions = [];
    const lines = code.split('\n');
    
    if (language === 'javascript') {
      if (code.includes('function') && !code.includes('=>')) {
        suggestions.push('Consider using arrow functions for better readability');
      }
      
      if (code.includes('.forEach') && code.includes('for (')) {
        suggestions.push('Consider using modern array methods like map/filter/reduce');
      }
    }
    
    if (lines.length > 50) {
      suggestions.push('Consider breaking down into smaller functions or modules');
    }
    
    const complexity = this.calculateComplexity(code, language);
    if (complexity.level === 'high') {
      suggestions.push('High complexity detected - consider simplifying logic or extracting functions');
    }

    // Проверка на комментарии
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*')
    ).length;
    
    const commentRatio = commentLines / Math.max(lines.length, 1);
    if (commentRatio < 0.1) {
      suggestions.push('Consider adding more comments for better code documentation');
    }
    
    return suggestions;
  }

  static calculateMetrics(code) {
    const lines = code.split('\n');
    const totalLines = lines.length;
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('#') && 
             !trimmed.startsWith('/*') &&
             !trimmed.startsWith('*') &&
             !trimmed.endsWith('*/');
    }).length;
    
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || 
             trimmed.startsWith('#') || 
             trimmed.startsWith('/*') ||
             trimmed.startsWith('*') ||
             trimmed.endsWith('*/');
    }).length;
    
    return {
      totalLines,
      codeLines,
      commentLines,
      blankLines: totalLines - codeLines - commentLines,
      commentRatio: commentLines / Math.max(codeLines, 1)
    };
  }
}