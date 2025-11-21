import React from 'react';
import { useAppStore } from '../state/appStore';

export const TopBar: React.FC = () => {
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const pushTelemetry = useAppStore((state) => state.pushTelemetryEvent);

  const handleAction = (action: string) => () => {
    pushTelemetry('topbar-action', { action });
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'linear-gradient(90deg,#141922,#1e2532)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={handleAction('run')}>Run</button>
        <button onClick={handleAction('pause')}>Pause</button>
        <button onClick={handleAction('reset')}>Reset</button>
        <button onClick={handleAction('save')}>Save</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>Beginner Mode</span>
        <button onClick={() => setSettingsOpen(true)}>Settings</button>
      </div>
    </header>
  );
};
