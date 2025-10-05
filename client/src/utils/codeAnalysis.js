// client/src/utils/codeAnalysis.js
export class CodeAnalyzer {
  static analyzeCode(code, language) {
    const analysis = {
      complexity: this.calculateComplexity(code, language),
      warnings: this.findWarnings(code, language),
      optimizations: this.suggestOptimizations(code, language),
      metrics: this.calculateMetrics(code, language)
    };
    
    return analysis;
  }

  static calculateComplexity(code, language) {
    const lines = code.split('\n');
    let complexity = 1; // Базовая сложность
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Увеличиваем сложность для управляющих структур
      if (this.isControlStructure(trimmed, language)) {
        complexity++;
      }
      
      // Увеличиваем сложность для вложенных структур
      if (this.isNestedStructure(trimmed, language)) {
        complexity += 0.5;
      }
    });
    
    return {
      score: Math.round(complexity * 10) / 10,
      level: complexity < 5 ? 'low' : complexity < 10 ? 'medium' : 'high'
    };
  }

  static findWarnings(code, language) {
    const warnings = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Проверка на потенциальные ошибки
      if (this.hasPotentialError(trimmed, language)) {
        warnings.push({
          line: index + 1,
          type: 'error',
          message: this.getErrorMessage(trimmed, language),
          severity: 'high'
        });
      }
      
      // Проверка на code smells
      if (this.hasCodeSmell(trimmed, language)) {
        warnings.push({
          line: index + 1,
          type: 'smell',
          message: this.getSmellMessage(trimmed, language),
          severity: 'medium'
        });
      }
    });
    
    return warnings;
  }

  static suggestOptimizations(code, language) {
    const suggestions = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (this.canBeOptimized(trimmed, language)) {
        suggestions.push({
          line: index + 1,
          suggestion: this.getOptimizationSuggestion(trimmed, language),
          before: trimmed,
          after: this.getOptimizedVersion(trimmed, language)
        });
      }
    });
    
    return suggestions;
  }

  static calculateMetrics(code, language) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const commentLines = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('#') || 
      line.trim().startsWith('/*')
    );
    
    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length - commentLines.length,
      commentLines: commentLines.length,
      blankLines: lines.length - nonEmptyLines.length,
      commentRatio: commentLines.length / nonEmptyLines.length
    };
  }

  // Вспомогательные методы
  static isControlStructure(line, language) {
    const jsPatterns = [/if\s*\(/, /for\s*\(/, /while\s*\(/, /switch\s*\(/, /catch\s*\(/];
    const pyPatterns = [/^if\s+/, /^for\s+/, /^while\s+/, /^except\s+/];
    
    const patterns = language === 'python' ? pyPatterns : jsPatterns;
    return patterns.some(pattern => pattern.test(line));
  }

  static isNestedStructure(line, language) {
    const nestingPatterns = [/\{\s*$/, /:\s*$/, /\(\s*$/];
    return nestingPatterns.some(pattern => pattern.test(line));
  }

  static hasPotentialError(line, language) {
    const errorPatterns = [
      /==\s*null/, /==\s*undefined/, /console\.log\(/, /alert\(/,
      /eval\(/, /innerHTML\s*=/, /innerHTML\s*\+=/
    ];
    
    return errorPatterns.some(pattern => pattern.test(line));
  }

  static hasCodeSmell(line, language) {
    const smellPatterns = [
      /function\s+\w+\(\s*\)\s*\{[^}]*\}/, // Длинная функция
      /if\s*\([^)]*&&[^)]*&&[^)]*\)/, // Сложное условие
      /for\s*\([^;]*;[^;]*;[^)]*\)\s*\{[^}]{100,}\}/ // Длинный цикл
    ];
    
    return smellPatterns.some(pattern => pattern.test(line));
  }

  static canBeOptimized(line, language) {
    const optimizationPatterns = [
      /===\s*true/, /!==\s*false/,
      /if\s*\(!!\w+\)/, /Boolean\(/,
      /for\s*\(var\s+\w+\s*=/,
      /function\s*\(\)\s*\{/,
      /\.innerHTML\s*=\s*["']<[^>]*>["']/
    ];
    
    return optimizationPatterns.some(pattern => pattern.test(line));
  }

  static getErrorMessage(line, language) {
    if (/==\s*null/.test(line)) return 'Use strict equality check (===) instead of == with null';
    if (/console\.log\(/.test(line)) return 'Remove console.log before production';
    if (/eval\(/.test(line)) return 'Avoid using eval() for security reasons';
    if (/innerHTML\s*=/.test(line)) return 'Consider using textContent instead of innerHTML for plain text';
    return 'Potential issue detected';
  }

  static getSmellMessage(line, language) {
    if (/function\s+\w+\(\s*\)\s*\{[^}]*\}/.test(line)) return 'Function might be too long - consider breaking it down';
    if (/if\s*\([^)]*&&[^)]*&&[^)]*\)/.test(line)) return 'Complex condition - consider extracting to separate function';
    return 'Code smell detected';
  }

  static getOptimizationSuggestion(line, language) {
    if (/===\s*true/.test(line)) return 'Remove redundant === true check';
    if (/for\s*\(var\s+\w+\s*=/.test(line)) return 'Use let/const instead of var';
    if (/function\s*\(\)\s*\{/.test(line)) return 'Use arrow function for better readability';
    return 'Optimization opportunity';
  }

  static getOptimizedVersion(line, language) {
    if (/===\s*true/.test(line)) return line.replace(/===\s*true/g, '');
    if (/for\s*\(var\s+\w+\s*=/.test(line)) return line.replace(/var\s+/g, 'let ');
    if (/function\s*\(\)\s*\{/.test(line)) return line.replace(/function\s*\(\s*\)\s*\{/, '() => {');
    return line;
  }
}

// Утилита для визуализации выполнения
export class ExecutionVisualizer {
  static createStepHistory() {
    return {
      steps: [],
      currentStep: 0,
      addStep(code, output) {
        this.steps.push({
          code,
          output,
          timestamp: new Date().toISOString(),
          analysis: CodeAnalyzer.analyzeCode(code, 'javascript')
        });
      },
      getStep(index) {
        return this.steps[index];
      },
      canGoBack() {
        return this.currentStep > 0;
      },
      canGoForward() {
        return this.currentStep < this.steps.length - 1;
      }
    };
  }
}