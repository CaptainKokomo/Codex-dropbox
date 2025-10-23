import { useEffect, useState } from 'react';
import { TopBar } from '@components/TopBar';
import { ComponentPalette } from '@components/ComponentPalette';
import { CanvasWorkspace } from '@components/CanvasWorkspace';
import { InspectorPanel } from '@components/InspectorPanel';
import { InstrumentationStrip } from '@components/InstrumentationStrip';
import { GamifiedCoach } from '@components/GamifiedCoach';
import { SettingsModal } from '@components/SettingsModal';
import { useNodeLabStore } from '@state/store';
import { useSimulationRunner } from '@hooks/useSimulation';
import { starterKits } from '@data/kits';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectFolder, setProjectFolder] = useState('');
  const { runSimulation, stopSimulation, simulation } = useSimulationRunner();
  const { setAutoUpdate, setLanguageMode, setTipsVisible, setAdvancedMode } = useNodeLabStore((state) => ({
    setAutoUpdate: state.setAutoUpdate,
    setLanguageMode: state.setLanguageMode,
    setTipsVisible: state.setTipsVisible,
    setAdvancedMode: state.setAdvancedMode
  }));

  const { languageMode, showTips, autoUpdate, advancedMode } = useNodeLabStore((state) => ({
    languageMode: state.languageMode,
    showTips: state.showTips,
    autoUpdate: state.autoUpdate,
    advancedMode: state.advancedMode
  }));

  useEffect(() => {
    void window.NodeLab?.getSettings().then((settings) => {
      const typedSettings = settings as {
        languageMode?: 'simple' | 'detailed';
        showTips?: boolean;
        autoUpdate?: boolean;
        advancedMode?: boolean;
        projectFolder?: string;
      };
      if (typedSettings.languageMode) {
        setLanguageMode(typedSettings.languageMode);
      }
      if (typeof typedSettings.showTips === 'boolean') {
        setTipsVisible(typedSettings.showTips);
      }
      if (typeof typedSettings.autoUpdate === 'boolean') {
        setAutoUpdate(typedSettings.autoUpdate);
      }
      if (typeof typedSettings.advancedMode === 'boolean') {
        setAdvancedMode(typedSettings.advancedMode);
      }
      if (typeof typedSettings.projectFolder === 'string') {
        setProjectFolder(typedSettings.projectFolder);
      }
    });
  }, [setAdvancedMode, setAutoUpdate, setLanguageMode, setTipsVisible]);

  const kits = starterKits;

  return (
    <div className="app-shell">
      <TopBar
        onRun={runSimulation}
        onPause={stopSimulation}
        onReset={() => stopSimulation()}
        onSettings={() => setSettingsOpen(true)}
        isRunning={Boolean(simulation)}
      />
      <div className="app-main">
        <ComponentPalette kits={kits} />
        <CanvasWorkspace />
        <InspectorPanel />
      </div>
      <InstrumentationStrip />
      <GamifiedCoach onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        languageMode={languageMode}
        showTips={showTips}
        autoUpdate={autoUpdate}
        advancedMode={advancedMode}
        projectFolder={projectFolder}
        onChangeLanguage={(mode) => {
          setLanguageMode(mode);
          void window.NodeLab?.updateSettings({ languageMode: mode });
        }}
        onToggleTips={(value) => {
          setTipsVisible(value);
          void window.NodeLab?.updateSettings({ showTips: value });
        }}
        onToggleAutoUpdate={(value) => {
          setAutoUpdate(value);
          void window.NodeLab?.updateSettings({ autoUpdate: value });
        }}
        onToggleAdvancedMode={(value) => {
          setAdvancedMode(value);
          void window.NodeLab?.updateSettings({ advancedMode: value });
        }}
        onChooseProjectFolder={async () => {
          const folder = await window.NodeLab?.chooseProjectFolder();
          if (folder) {
            setProjectFolder(folder);
            void window.NodeLab?.updateSettings({ projectFolder: folder });
          }
        }}
      />
    </div>
  );
}

export default App;
