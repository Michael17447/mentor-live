// client/src/utils/simpleAnalysis.js

export class SimpleCodeAnalyzer {
  static analyze(code, language = 'javascript') {
    try {
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
    } catch (error) {
      console.error('Analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  static calculateMetrics(lines) {
    const totalLines = lines.length;
    const codeLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*') &&
             !trimmed.startsWith('#');
    }).length;
    
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || 
             trimmed.startsWith('/*') || 
             trimmed.startsWith('*') ||
             trimmed.startsWith('#');
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
        /\?.*:/g,
        /&&|\|\|/g
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
      ]
    };

    const patterns = controlStructures[language] || controlStructures.javascript;
    
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
      ]
    };

    const patterns = warningPatterns[language] || warningPatterns.javascript;
    
    patterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        warnings.push(message);
      }
    });

    // Проверка TODO/FIXME
    const todoPattern = /TODO|FIXME|XXX/gi;
    if (todoPattern.test(code)) {
      warnings.push('Обнаружены метки TODO/FIXME - требуется доработка');
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

  static getDefaultAnalysis() {
    return {
      complexity: { score: 0, level: 'low', description: 'Анализ не выполнен' },
      warnings: [],
      metrics: { totalLines: 0, codeLines: 0, commentLines: 0, blankLines: 0, commentRatio: 0 },
      suggestions: ['Анализ кода временно недоступен'],
      timestamp: new Date().toISOString()
    };
  }
}

export default SimpleCodeAnalyzer;