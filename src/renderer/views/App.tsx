import React, { useEffect } from 'react';
import { TopBar } from '../components/TopBar';
import { ComponentPalette } from '../components/ComponentPalette';
import { CircuitCanvas } from '../components/CircuitCanvas';
import { InspectorPanel } from '../components/InspectorPanel';
import { InstrumentationStrip } from '../components/InstrumentationStrip';
import { useAppStore } from '../state/appStore';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { TelemetryRecorder } from '../telemetry/TelemetryRecorder';

export const App: React.FC = () => {
  const initialize = useAppStore((state) => state.initializeApp);
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div
      className="app-shell"
      style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', position: 'relative' }}
    >
      <TopBar />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 320px',
          gridTemplateRows: '1fr',
          minHeight: 0
        }}
      >
        <ComponentPalette />
        <CircuitCanvas />
        <InspectorPanel />
      </div>
      <InstrumentationStrip />
      <SettingsDrawer />
      <TutorialOverlay />
      <TelemetryRecorder />
    </div>
  );
};
