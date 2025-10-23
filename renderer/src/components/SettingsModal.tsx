interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  languageMode: 'simple' | 'detailed';
  showTips: boolean;
  autoUpdate: boolean;
  advancedMode: boolean;
  onChangeLanguage: (mode: 'simple' | 'detailed') => void;
  onToggleTips: (value: boolean) => void;
  onToggleAutoUpdate: (value: boolean) => void;
  onToggleAdvancedMode: (value: boolean) => void;
  projectFolder: string;
  onChooseProjectFolder: () => Promise<void> | void;
}

export function SettingsModal({
  isOpen,
  onClose,
  languageMode,
  showTips,
  autoUpdate,
  advancedMode,
  onChangeLanguage,
  onToggleTips,
  onToggleAutoUpdate,
  onToggleAdvancedMode,
  projectFolder,
  onChooseProjectFolder
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="settings-overlay" role="dialog" aria-modal>
      <div className="settings-modal">
        <header className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} aria-label="Close settings">✕</button>
        </header>
        <section className="settings-section">
          <h3>Language style</h3>
          <div className="settings-row">
            <label>
              <input
                type="radio"
                name="languageMode"
                value="simple"
                checked={languageMode === 'simple'}
                onChange={() => onChangeLanguage('simple')}
              />
              Simple terms
            </label>
            <label>
              <input
                type="radio"
                name="languageMode"
                value="detailed"
                checked={languageMode === 'detailed'}
                onChange={() => onChangeLanguage('detailed')}
              />
              More detail
            </label>
          </div>
        </section>
        <section className="settings-section">
          <h3>Guidance</h3>
          <label className="settings-toggle">
            <input type="checkbox" checked={showTips} onChange={(event) => onToggleTips(event.target.checked)} />
            Show coaching hints
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={advancedMode}
              onChange={(event) => onToggleAdvancedMode(event.target.checked)}
            />
            Advanced sandbox (reveals high-voltage parts)
          </label>
        </section>
        <section className="settings-section">
          <h3>Updates</h3>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(event) => onToggleAutoUpdate(event.target.checked)}
            />
            Auto-update NodeLab
          </label>
        </section>
        <section className="settings-section">
          <h3>Project folder</h3>
          <div className="settings-folder">
            <span>{projectFolder || 'Choose where to save new projects'}</span>
            <button
              onClick={() => {
                void onChooseProjectFolder();
              }}
            >
              Choose…
            </button>
          </div>
        </section>
        <footer className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
