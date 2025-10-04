// client/src/components/LanguageSelector.jsx
import React, { useState, useMemo } from 'react';
import { SUPPORTED_LANGUAGES, LANGUAGE_CATEGORIES, LANGUAGE_SNIPPETS } from '../languages.js';

const LanguageSelector = ({ 
  onLanguageSelect, 
  selectedLanguage = 'javascript', 
  showSnippets = false,
  compact = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSnippetsPanel, setShowSnippetsPanel] = useState(false);

  const filteredLanguages = useMemo(() => {
    return Object.entries(SUPPORTED_LANGUAGES).filter(([key, lang]) => {
      const matchesSearch = lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             LANGUAGE_CATEGORIES[selectedCategory]?.includes(key);
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const categories = {
    all: "🌍 All Languages",
    ...Object.keys(LANGUAGE_CATEGORIES).reduce((acc, category) => {
      const icons = {
        web: "🌐",
        backend: "⚙️", 
        mobile: "📱",
        data: "📊",
        markup: "📝"
      };
      acc[category] = `${icons[category] || "📁"} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
      return acc;
    }, {})
  };

  const insertSnippet = (snippet) => {
    // Этот метод будет вызван из родительского компонента
    if (window.insertCodeSnippet) {
      window.insertCodeSnippet(snippet);
    }
    setShowSnippetsPanel(false);
  };

  if (compact) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowSnippetsPanel(!showSnippetsPanel)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: '#374151',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            minWidth: '120px'
          }}
        >
          <span>{SUPPORTED_LANGUAGES[selectedLanguage]?.icon}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>
            {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
          </span>
          <span>▼</span>
        </button>

        {showSnippetsPanel && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 3000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
              <button
                key={key}
                onClick={() => {
                  onLanguageSelect(key);
                  setShowSnippetsPanel(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: selectedLanguage === key ? '#3b82f6' : 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}
              >
                <span>{lang.icon}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'white', margin: 0 }}>
          Choose Programming Language
        </h3>
        
        {showSnippets && LANGUAGE_SNIPPETS[selectedLanguage] && (
          <button
            onClick={() => setShowSnippetsPanel(!showSnippetsPanel)}
            style={{
              padding: '6px 12px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            📋 Snippets
          </button>
        )}
      </div>

      {/* Поиск и фильтры */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍 Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: 'white',
            marginBottom: '8px'
          }}
        />
        
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '6px 12px',
                background: selectedCategory === key ? '#3b82f6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '11px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Список языков */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '8px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {filteredLanguages.map(([key, lang]) => (
          <button
            key={key}
            onClick={() => onLanguageSelect(key)}
            style={{
              padding: '12px',
              background: selectedLanguage === key ? '#3b82f6' : '#374151',
              border: selectedLanguage === key ? '2px solid #60a5fa' : '1px solid #4b5563',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{lang.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {lang.name}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {lang.extension}
                </div>
              </div>
            </div>
            
            {selectedLanguage === key && (
              <div style={{
                fontSize: '10px',
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                alignSelf: 'flex-start'
              }}>
                ✅ Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredLanguages.length === 0 && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
          No languages found matching your search
        </div>
      )}

      {/* Панель сниппетов */}
      {showSnippetsPanel && LANGUAGE_SNIPPETS[selectedLanguage] && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#111827',
          borderRadius: '6px',
          border: '1px solid #374151'
        }}>
          <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '14px' }}>
            📋 Code Snippets for {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(LANGUAGE_SNIPPETS[selectedLanguage]).map(([name, snippet]) => (
              <button
                key={name}
                onClick={() => insertSnippet(snippet)}
                style={{
                  padding: '6px 8px',
                  background: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}
              >
                <strong>{name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;