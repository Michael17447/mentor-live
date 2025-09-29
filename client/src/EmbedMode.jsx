import React from 'react';
import EditorMirror from './EditorMirror.jsx';

export default function EmbedMode({ sessionId, role = 'student' }) {
  const userId = 'embed-user-' + Math.random().toString(36).substring(2, 8);
  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <EditorMirror
        sessionId={sessionId}
        isMentor={role === 'mentor'}
        userId={userId}
        embedMode={true}
      />
    </div>
  );
}