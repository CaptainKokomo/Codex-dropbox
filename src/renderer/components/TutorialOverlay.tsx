import React from 'react';
import { useAppStore } from '../state/appStore';

export const TutorialOverlay: React.FC = () => {
  const tutorialState = useAppStore((state) => state.tutorialState);

  if (!tutorialState.overlayMessage || tutorialState.completed) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 1.5rem',
        background: 'rgba(15, 17, 21, 0.9)',
        borderRadius: '1rem',
        border: '1px solid rgba(47, 140, 255, 0.5)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)'
      }}
    >
      <strong>Quick Tip</strong>
      <div style={{ marginTop: '0.5rem', maxWidth: '400px' }}>{tutorialState.overlayMessage}</div>
    </div>
  );
};
