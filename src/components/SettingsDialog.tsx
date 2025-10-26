import { useEffect, useState } from 'react';
import { useCircuitStore } from '../state/store';
import './SettingsDialog.css';

export const SettingsDialog = () => {
  const settings = useCircuitStore((state) => state.settings);
  const updateSettings = useCircuitStore((state) => state.updateSettings);
  const isOpen = useCircuitStore((state) => state.ui.settingsOpen);
  const closeSettings = useCircuitStore((state) => state.closeSettings);

  const [autoUpdate, setAutoUpdate] = useState(settings.autoUpdate);

  useEffect(() => {
    setAutoUpdate(settings.autoUpdate);
  }, [settings.autoUpdate]);

  if (!isOpen) return null;

  return (
    <div className="settings-backdrop" onClick={closeSettings}>
      <div
        className="settings-dialog"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <header>
          <h2>Settings</h2>
          <p>Fine-tune NodeLab without leaving beginner mode.</p>
        </header>
        <section>
          <label className="row">
            <span>Simple language</span>
            <input
              type="checkbox"
              checked={settings.simpleLanguage}
              onChange={(event) => updateSettings({ simpleLanguage: event.target.checked })}
            />
          </label>
          <label className="row">
            <span>Show coaching tips</span>
            <input
              type="checkbox"
              checked={settings.showTips}
              onChange={(event) => updateSettings({ showTips: event.target.checked })}
            />
          </label>
          <label className="row">
            <span>Auto-update</span>
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(event) => {
                const value = event.target.checked;
                setAutoUpdate(value);
                window.electronAPI.setAutoUpdate(value);
                updateSettings({ autoUpdate: value });
              }}
            />
          </label>
          <div className="row">
            <span>Project folder</span>
            <button onClick={() => window.electronAPI.chooseProjectFolder()}>Change…</button>
          </div>
          <div className="project-path">{settings.projectFolder ?? 'Not selected yet'}</div>
        </section>
        <footer>
          <button onClick={closeSettings}>Close</button>
        </footer>
      </div>
    </div>
  );
};
