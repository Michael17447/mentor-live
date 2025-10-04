// client/src/components/CreateSessionWizard.jsx
import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector.jsx';
import { SUPPORTED_LANGUAGES } from '../languages.js';

const CreateSessionWizard = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [sessionType, setSessionType] = useState('mentoring');
  const [sessionCreated, setSessionCreated] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [step, setStep] = useState(1);

  const sessionTypes = {
    mentoring: {
      icon: "👨‍🏫",
      name: "Mentoring Session",
      description: "One-on-one coding mentorship with a student"
    },
    interview: {
      icon: "💼", 
      name: "Technical Interview",
      description: "Coding interview with real-time collaboration"
    },
    pairing: {
      icon: "👥",
      name: "Pair Programming",
      description: "Collaborative coding session between peers"
    },
    teaching: {
      icon: "📚",
      name: "Group Teaching",
      description: "Teaching coding concepts to multiple students"
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLanguage,
          role: 'mentor',
          sessionType: sessionType
        })
      });
      
      const data = await response.json();
      setSessionData(data);
      setSessionCreated(true);
      setStep(3);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    }
  };

  const renderStep1 = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ color: 'white', marginBottom: '8px' }}>🎯 Session Type</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Choose the type of coding session you want to start
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {Object.entries(sessionTypes).map(([key, type]) => (
          <button
            key={key}
            onClick={() => {
              setSessionType(key);
              setStep(2);
            }}
            style={{
              padding: '16px',
              background: sessionType === key ? '#3b82f6' : '#374151',
              border: '2px solid transparent',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {type.icon}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {type.name}
            </div>
            <div style={{ fontSize: '12px', color: '#d1d5db' }}>
              {type.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'white', marginBottom: '8px' }}>
          {sessionTypes[sessionType].icon} {sessionTypes[sessionType].name}
        </h2>
        <p style={{ color: '#9ca3af' }}>
          Choose programming language for your session
        </p>
      </div>

      <LanguageSelector 
        onLanguageSelect={setSelectedLanguage}
        selectedLanguage={selectedLanguage}
        showSnippets={true}
      />

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#111827',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <h4 style={{ color: 'white', margin: '0 0 8px 0' }}>
          Session Preview
        </h4>
        <div style={{ color: '#9ca3af', fontSize: '14px' }}>
          <div><strong>Type:</strong> {sessionTypes[sessionType].name}</div>
          <div><strong>Language:</strong> {SUPPORTED_LANGUAGES[selectedLanguage]?.icon} {SUPPORTED_LANGUAGES[selectedLanguage]?.name}</div>
          <div><strong>Default Code:</strong> {SUPPORTED_LANGUAGES[selectedLanguage]?.starterCode.split('\n')[0]}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
        <button
          onClick={() => setStep(1)}
          style={{
            padding: '10px 20px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          onClick={createSession}
          style={{
            padding: '10px 30px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Create Session 🚀
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ color: 'white', marginBottom: '8px' }}>Session Created!</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        Your {sessionTypes[sessionType].name} is ready
      </p>

      <div style={{
        background: '#111827',
        borderRadius: '8px',
        padding: '20px',
        margin: '0 auto 24px',
        maxWidth: '500px',
        textAlign: 'left'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          marginBottom: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid #374151'
        }}>
          <span style={{ fontSize: '24px' }}>
            {SUPPORTED_LANGUAGES[selectedLanguage]?.icon}
          </span>
          <div>
            <div style={{ fontWeight: 'bold', color: 'white' }}>
              {SUPPORTED_LANGUAGES[selectedLanguage]?.name} Session
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              ID: {sessionData?.session_id}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <strong style={{ color: '#9ca3af' }}>Join URL:</strong>
            <div style={{ 
              background: '#1f2937', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '4px',
              wordBreak: 'break-all',
              fontSize: '12px'
            }}>
              {sessionData?.join_url}
            </div>
          </div>

          <div>
            <strong style={{ color: '#9ca3af' }}>Embed Code:</strong>
            <div style={{ 
              background: '#1f2937', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '4px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              {sessionData?.embed_iframe}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.href = sessionData?.join_url}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Start Session Now
        </button>
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(sessionData?.join_url);
            alert('Join URL copied to clipboard!');
          }}
          style={{
            padding: '12px 24px',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Copy Join URL
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#1f2937',
      borderRadius: '12px',
      maxWidth: '800px',
      margin: '20px auto',
      minHeight: '500px',
      border: '1px solid #374151'
    }}>
      {/* Progress indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        borderBottom: '1px solid #374151'
      }}>
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= stepNumber ? '#3b82f6' : '#374151',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div style={{
                width: '40px',
                height: '2px',
                background: step > stepNumber ? '#3b82f6' : '#374151',
                margin: '0 8px'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default CreateSessionWizard;