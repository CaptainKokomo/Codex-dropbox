import React, { useEffect } from 'react';
import { usePreferencesStore } from './state/preferences.js';
import { FirstRunWizard } from './features/onboarding/FirstRunWizard.js';
import { GuidedTourOverlay } from './features/onboarding/GuidedTourOverlay.js';

export const App: React.FC = () => {
  const loadPreferences = usePreferencesStore((state) => state.loadPreferences);
  const loading = usePreferencesStore((state) => state.loading);
  const wizardCompleted = usePreferencesStore((state) => state.wizard.completed);

  useEffect(() => {
    loadPreferences().catch((error) => {
      console.error('Failed to load preferences', error);
    });
  }, [loadPreferences]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          fontSize: '1.1rem',
          letterSpacing: '0.05em',
        }}
      >
        Preparing your bench...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {!wizardCompleted ? <FirstRunWizard /> : <WorkbenchPlaceholder />}
      <GuidedTourOverlay />
    </div>
  );
};

const WorkbenchPlaceholder: React.FC = () => {
  const resetOnboarding = usePreferencesStore((state) => state.resetOnboarding);
  const preferences = usePreferencesStore((state) => state.preferences);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '1rem',
        color: '#c7d7ff',
      }}
    >
      <h1 style={{ margin: 0 }}>NodeLab Workbench</h1>
      <p style={{ maxWidth: 420, textAlign: 'center', lineHeight: 1.5 }}>
        The interactive breadboard bench arrives in the next stage. For now, your preferences are saved and the tour prepares you
        for hands-on building.
      </p>
      <button
        onClick={() => resetOnboarding()}
        style={{
          border: '1px solid rgba(91, 230, 193, 0.5)',
          background: 'transparent',
          color: '#5be6c1',
          padding: '0.65rem 1.5rem',
          borderRadius: '999px',
          cursor: 'pointer',
        }}
        type='button'
      >
        Reset first-run wizard
      </button>
      <small style={{ color: 'rgba(235, 244, 255, 0.55)' }}>Save folder: {preferences?.saveFolder ?? 'Not set'}</small>
    </div>
  );
};
