import { useEffect } from 'react';
import { ComponentPalette } from './components/ComponentPalette';
import { TopToolbar } from './components/TopToolbar';
import { InspectorPanel } from './components/InspectorPanel';
import { ScopePanel } from './components/ScopePanel';
import { CoachingFeed } from './components/CoachingFeed';
import { SettingsDialog } from './components/SettingsDialog';
import { TutorialOverlay } from './components/TutorialOverlay';
import { CircuitCanvas } from './canvas/CircuitCanvas';
import { useCircuitStore } from './state/store';
import { SimulationBridge } from './components/SimulationBridge';
import './styles/layout.css';

const App = () => {
  const updateSettings = useCircuitStore((state) => state.updateSettings);

  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    window.electronAPI
      .getSettings()
      .then((settings) => {
        updateSettings({
          projectFolder: settings.projectFolder,
          autoUpdate: settings.autoUpdate,
          darkMode: settings.darkMode
        });
      })
      .catch(() => {
        // Ignore failures when running in browser
      });

    window.electronAPI.onProjectFolderSelected((folder) => {
      updateSettings({ projectFolder: folder });
    });

    window.electronAPI.onAppVersion((version) => {
      useCircuitStore.getState().addCoachingMessage(`Running NodeLab ${version}`, 'info');
    });
    window.electronAPI.requestAppVersion();
  }, [updateSettings]);

  return (
    <div className="app-root">
      <TopToolbar />
      <div className="app-main">
        <ComponentPalette />
        <CircuitCanvas />
        <InspectorPanel />
      </div>
      <ScopePanel />
      <CoachingFeed />
      <SettingsDialog />
      <TutorialOverlay />
      <SimulationBridge />
    </div>
  );
};

export default App;
