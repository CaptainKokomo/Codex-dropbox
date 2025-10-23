import { clsx } from 'clsx';
import { useNodeLabStore } from '@state/store';
import { useProjectPersistence } from '@hooks/useProjectPersistence';

interface TopBarProps {
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onSettings: () => void;
  isRunning: boolean;
}

export function TopBar({ onRun, onPause, onReset, onSettings, isRunning }: TopBarProps) {
  const { diagnostics, languageMode } = useNodeLabStore((state) => ({
    diagnostics: state.diagnostics,
    languageMode: state.languageMode
  }));
  const { saveProject } = useProjectPersistence();

  return (
    <header className="top-bar">
      <div className="brand-area">
        <span className="brand-mark">⚡</span>
        <span className="brand-title">NodeLab</span>
      </div>
      <div className="top-bar-controls">
        <button
          className={clsx('top-btn', isRunning ? 'btn-muted' : 'btn-primary')}
          onClick={onRun}
          disabled={isRunning}
        >
          ▶ Run
        </button>
        <button className="top-btn btn-secondary" onClick={onPause} disabled={!isRunning}>
          ❚❚ Pause
        </button>
        <button className="top-btn btn-ghost" onClick={onReset}>
          ↺ Reset
        </button>
        <button
          className="top-btn btn-secondary"
          onClick={() => {
            void saveProject();
          }}
        >
          💾 Save
        </button>
        <button className="top-btn btn-ghost" onClick={onSettings}>
          ⚙ Settings
        </button>
      </div>
      <div className="top-bar-status">
        <span className="language-pill">Mode: {languageMode === 'simple' ? 'Simple terms' : 'More detail'}</span>
        {diagnostics.length > 0 && <span className="diagnostics-pill">{diagnostics.length} tips</span>}
      </div>
    </header>
  );
}
