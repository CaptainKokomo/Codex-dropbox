import React from 'react';
import { useAppStore } from '../state/appStore';

export const SettingsDrawer: React.FC = () => {
  const settingsOpen = useAppStore((state) => state.settingsOpen);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const tipsEnabled = useAppStore((state) => state.tipsEnabled);
  const toggleTips = useAppStore((state) => state.toggleTips);

  if (!settingsOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={() => setSettingsOpen(false)}
    >
      <div
        style={{
          width: '320px',
          height: '100%',
          background: '#1b2130',
          padding: '1.5rem',
          display: 'grid',
          gap: '1rem'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Settings</h2>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>Language Style</span>
          <select value={themeMode} onChange={(event) => setThemeMode(event.target.value as any)}>
            <option value="beginner">Simple terms</option>
            <option value="detailed">More detail</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={tipsEnabled} onChange={toggleTips} />
          Show “?” explanations
        </label>
        <button onClick={() => setSettingsOpen(false)}>Close</button>
      </div>
    </div>
  );
};
