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
  const [showDropdown, setShowDropdown] = useState(false);
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
    if (window.insertCodeSnippet) {
      window.insertCodeSnippet(snippet);
    }
    setShowSnippetsPanel(false);
  };

  // Compact mode for EditorMirror
  if (compact) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#374151',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '160px',
            justifyContent: 'space-between'
          }}
          title="Change programming language"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.icon}
            </span>
            <span>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
            </span>
          </span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>▼</span>
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 9999,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            {/* Search in compact mode */}
            <div style={{ padding: '8px', borderBottom: '1px solid #374151' }}>
              <input
                type="text"
                placeholder="🔍 Search languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: '#111827',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Language list */}
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {(searchTerm ? filteredLanguages : Object.entries(SUPPORTED_LANGUAGES))
                .map(([key, lang]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onLanguageSelect(key);
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: selectedLanguage === key ? '#3b82f6' : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '14px',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                      borderBottom: '1px solid #374151'
                    }}
                  >
                    <span style={{ fontSize: '18px', width: '24px' }}>{lang.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{lang.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>{lang.extension}</div>
                    </div>
                    {selectedLanguage === key && (
                      <span style={{ 
                        fontSize: '10px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Active
                      </span>
                    )}
                  </button>
                ))
              }
              
              {filteredLanguages.length === 0 && searchTerm && (
                <div style={{ 
                  padding: '16px', 
                  color: '#9ca3af', 
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  No languages found matching "{searchTerm}"
                </div>
              )}
            </div>

            {/* Snippets button in compact mode */}
            {showSnippets && LANGUAGE_SNIPPETS[selectedLanguage] && (
              <div style={{ 
                padding: '8px', 
                borderTop: '1px solid #374151',
                background: '#111827'
              }}>
                <button
                  onClick={() => {
                    setShowSnippetsPanel(!showSnippetsPanel);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📋 Snippets
                </button>
              </div>
            )}
          </div>
        )}

        {/* Snippets panel */}
        {showSnippetsPanel && LANGUAGE_SNIPPETS[selectedLanguage] && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            marginTop: '4px',
            padding: '12px',
            zIndex: 9998,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h4 style={{ 
                color: 'white', 
                margin: 0, 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                📋 {SUPPORTED_LANGUAGES[selectedLanguage]?.name} Snippets
              </h4>
              <button
                onClick={() => setShowSnippetsPanel(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px'
                }}
              >
                ✕
              </button>
            </div>
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
                    fontSize: '11px',
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
  }

  // Full mode for session creation
  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '700px',
      margin: '0 auto',
      border: '1px solid #374151'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>
          Choose Programming Language
        </h3>
        
        {showSnippets && LANGUAGE_SNIPPETS[selectedLanguage] && (
          <button
            onClick={() => setShowSnippetsPanel(!showSnippetsPanel)}
            style={{
              padding: '8px 16px',
              background: showSnippetsPanel ? '#7c3aed' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            📋 Code Snippets
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search languages by name or extension..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: 'white',
            marginBottom: '12px',
            fontSize: '14px'
          }}
        />
        
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === key ? '#3b82f6' : '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: selectedCategory === key ? '600' : '400'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Languages grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '4px'
      }}>
        {filteredLanguages.map(([key, lang]) => (
          <button
            key={key}
            onClick={() => onLanguageSelect(key)}
            style={{
              padding: '16px',
              background: selectedLanguage === key ? '#3b82f6' : '#374151',
              border: selectedLanguage === key ? '2px solid #60a5fa' : '1px solid #4b5563',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minHeight: '80px'
            }}
            onMouseOver={(e) => {
              if (selectedLanguage !== key) {
                e.target.style.background = '#4b5563';
                e.target.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedLanguage !== key) {
                e.target.style.background = '#374151';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{lang.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '2px' }}>
                  {lang.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {key} • {lang.extension}
                </div>
              </div>
            </div>
            
            {selectedLanguage === key && (
              <div style={{
                fontSize: '11px',
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 8px',
                borderRadius: '6px',
                alignSelf: 'flex-start',
                fontWeight: '600'
              }}>
                ✅ Currently Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredLanguages.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: '#9ca3af', 
          padding: '40px 20px',
          fontSize: '14px'
        }}>
          No languages found matching "{searchTerm}"
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            Try a different search term or select another category
          </div>
        </div>
      )}

      {/* Snippets panel */}
      {showSnippetsPanel && LANGUAGE_SNIPPETS[selectedLanguage] && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#111827',
          borderRadius: '8px',
          border: '1px solid #374151'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ color: 'white', margin: 0, fontSize: '16px' }}>
              📋 Code Snippets for {SUPPORTED_LANGUAGES[selectedLanguage]?.name}
            </h4>
            <button
              onClick={() => setShowSnippetsPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '8px' 
          }}>
            {Object.entries(LANGUAGE_SNIPPETS[selectedLanguage]).map(([name, snippet]) => (
              <button
                key={name}
                onClick={() => insertSnippet(snippet)}
                style={{
                  padding: '10px 12px',
                  background: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#374151'}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {snippet.split('\n')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;