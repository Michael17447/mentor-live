// client/src/utils/simpleAnalysis.js

export class SimpleCodeAnalyzer {
  static analyze(code, language = 'javascript') {
    const lines = code.split('\n');
    
    // Базовые метрики
    const metrics = this.calculateMetrics(lines);
    
    // Анализ сложности
    const complexity = this.analyzeComplexity(code, language);
    
    // Поиск предупреждений
    const warnings = this.findWarnings(code, language);
    
    // Генерация предложений
    const suggestions = this.generateSuggestions(code, language, complexity);
    
    return {
      complexity,
      warnings,
      metrics,
      suggestions,
      timestamp: new Date().toISOString()
    };
  }

  static calculateMetrics(lines) {
    const totalLines = lines.length;
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
    }).length;
    
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
    }).length;
    
    const blankLines = lines.filter(line => line.trim().length === 0).length;
    
    const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;

    return {
      totalLines,
      codeLines,
      commentLines,
      blankLines,
      commentRatio: Math.round(commentRatio * 100) / 100
    };
  }

  static analyzeComplexity(code, language) {
    let score = 0;
    
    // Подсчет структур управления
    const controlStructures = {
      javascript: [
        /if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /switch\s*\(/g,
        /catch\s*\(/g,
        /\?.*:/g, // ternary operator
        /&&|\|\|/g // logical operators
      ],
      python: [
        /if\s+/g,
        /for\s+/g,
        /while\s+/g,
        /try:/g,
        /except/g,
        /and|or/g
      ],
      java: [
        /if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /switch\s*\(/g,
        /catch\s*\(/g,
        /\?.*:/g,
        /&&|\|\|/g
      ],
      cpp: [
        /if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /switch\s*\(/g,
        /catch\s*\(/g,
        /\?.*:/g,
        /&&|\|\|/g
      ],
      default: [
        /if\s*\(/g,
        /for\s*\(/g,
        /while\s*\(/g,
        /switch\s*\(/g
      ]
    };

    const patterns = controlStructures[language] || controlStructures.default;
    
    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        score += matches.length;
      }
    });

    // Определение уровня сложности
    let level = 'low';
    if (score > 10) level = 'high';
    else if (score > 5) level = 'medium';

    return {
      score,
      level,
      description: this.getComplexityDescription(level)
    };
  }

  static findWarnings(code, language) {
    const warnings = [];
    
    const warningPatterns = {
      javascript: [
        {
          pattern: /console\.log/g,
          message: 'Обнаружены console.log - рекомендуется убрать для продакшена'
        },
        {
          pattern: /alert\(/g,
          message: 'Обнаружен alert - не рекомендуется для пользовательского интерфейса'
        },
        {
          pattern: /eval\(/g,
          message: 'ОПАСНО: обнаружен eval - может быть уязвимостью безопасности'
        },
        {
          pattern: /var\s+\w+/g,
          message: 'Используется var - рекомендуется использовать let или const'
        }
      ],
      python: [
        {
          pattern: /print\(/g,
          message: 'Обнаружены print - рекомендуется использовать логирование'
        },
        {
          pattern: /exec\(/g,
          message: 'ОПАСНО: обнаружен exec - может быть уязвимостью безопасности'
        }
      ],
      java: [
        {
          pattern: /System\.out\.println/g,
          message: 'Обнаружен System.out.println - рекомендуется использовать логгер'
        }
      ],
      default: [
        {
          pattern: /TODO|FIXME|XXX/gi,
          message: 'Обнаружены метки TODO/FIXME - требуется доработка'
        }
      ]
    };

    const patterns = [...(warningPatterns[language] || []), ...warningPatterns.default];
    
    patterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        warnings.push(message);
      }
    });

    // Проверка длины функций/методов
    const functionPattern = language === 'python' ? /def\s+\w+\([^)]*\):/g : /function\s+\w+\([^)]*\)\s*{/g;
    if (functionPattern.test(code)) {
      const lines = code.split('\n');
      let inFunction = false;
      let functionLineCount = 0;
      let currentFunction = '';

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        if (functionPattern.test(trimmed)) {
          if (inFunction && functionLineCount > 20) {
            warnings.push(`Функция ${currentFunction} слишком длинная (${functionLineCount} строк)`);
          }
          inFunction = true;
          functionLineCount = 0;
          currentFunction = trimmed.match(functionPattern)?.[0] || 'unknown';
        }
        
        if (inFunction) {
          functionLineCount++;
          
          // Проверка конца функции
          if ((language === 'python' && trimmed.match(/^\w/)) || 
              (language !== 'python' && trimmed === '}')) {
            if (functionLineCount > 20) {
              warnings.push(`Функция ${currentFunction} слишком длинная (${functionLineCount} строк)`);
            }
            inFunction = false;
          }
        }
      });
    }

    return warnings;
  }

  static generateSuggestions(code, language, complexity) {
    const suggestions = [];

    // Предложения по сложности
    if (complexity.level === 'high') {
      suggestions.push('Высокая сложность кода - рассмотрите рефакторинг на более мелкие функции');
    }

    // Предложения по языку
    const languageSuggestions = {
      javascript: [
        'Используйте const для неизменяемых переменных',
        'Рассмотрите использование стрелочных функций',
        'Проверьте обработку ошибок с try/catch'
      ],
      python: [
        'Используйте type hints для лучшей читаемости',
        'Рассмотрите использование list/dict comprehensions',
        'Проверьте обработку исключений'
      ],
      java: [
        'Добавьте javadoc комментарии',
        'Проверьте модификаторы доступа',
        'Рассмотрите использование Stream API'
      ],
      cpp: [
        'Проверьте управление памятью',
        'Используйте умные указатели',
        'Рассмотрите использование STL контейнеров'
      ]
    };

    const langSuggestions = languageSuggestions[language] || [];
    suggestions.push(...langSuggestions);

    // Предложения по структуре кода
    if (code.length > 500) {
      suggestions.push('Код довольно длинный - рассмотрите разделение на модули');
    }

    const lines = code.split('\n');
    const commentRatio = lines.filter(line => 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('#') ||
      line.trim().startsWith('*')
    ).length / lines.length;

    if (commentRatio < 0.1) {
      suggestions.push('Добавьте комментарии для лучшей читаемости кода');
    }

    return suggestions;
  }

  static getComplexityDescription(level) {
    const descriptions = {
      low: 'Простой код, легко читается и поддерживается',
      medium: 'Умеренная сложность, требуется некоторое внимание',
      high: 'Высокая сложность, рекомендуется рефакторинг'
    };
    return descriptions[level] || 'Неизвестный уровень сложности';
  }

  // Дополнительные утилиты
  static countOccurrences(text, pattern) {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  }

  static hasNestedStructures(code, language) {
    const nestedPatterns = {
      javascript: /if\s*\([^)]*\)\s*\{[^{}]*if\s*\([^)]*\)/g,
      python: /if[^{}:]*:\s*\n\s*if/g,
      default: /if\s*\([^)]*\)\s*\{[^{}]*if\s*\([^)]*\)/g
    };
    
    const pattern = nestedPatterns[language] || nestedPatterns.default;
    return pattern.test(code);
  }
}

export default SimpleCodeAnalyzer;