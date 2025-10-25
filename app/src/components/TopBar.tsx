import { useUI } from '../state/uiStore';
import { useSimulation } from '../state/simulationStore';
import { useProject } from '../state/projectStore';
import { useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { useShareLink } from '../services/shareLinkService';

const buttonBase =
  'rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const TopBar = () => {
  const { beginnerMode, toggleBeginnerMode, languageStyle, toggleLanguageStyle } = useUI();
  const { isRunning, run, pause, reset } = useSimulation();
  const { saveProjectAs, exportCanvasImage } = useProject();
  const { upload, status, lastLink, flushQueue } = useShareLink();

  useEffect(() => {
    if (status === 'queued') {
      const interval = setInterval(() => {
        flushQueue().catch((error) => console.error(error));
      }, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status, flushQueue]);

  const handleSave = useCallback(() => {
    saveProjectAs().catch(console.error);
  }, [saveProjectAs]);

  const handleExport = useCallback(() => {
    exportCanvasImage().catch(console.error);
  }, [exportCanvasImage]);

  return (
    <header
      className="flex items-center justify-between border-b border-slate-800 bg-panel px-4 py-3"
      aria-label="Main controls"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={isRunning ? pause : run}
          className={clsx(buttonBase, isRunning ? 'bg-success/20 text-success' : 'text-slate-100')}
          aria-pressed={isRunning}
        >
          {isRunning ? 'Pause' : 'Run'}
        </button>
        <button onClick={reset} className={buttonBase}>
          Reset
        </button>
        <button onClick={handleSave} className={buttonBase}>
          Save Project
        </button>
        <button onClick={handleExport} className={buttonBase}>
          Export Image
        </button>
        <button onClick={() => upload().catch(console.error)} className={buttonBase}>
          Share Link
        </button>
        {lastLink && (
          <a
            href={lastLink}
            className="text-xs text-accent underline"
            target="_blank"
            rel="noreferrer"
          >
            Copied: {lastLink}
          </a>
        )}
        <span className="text-xs text-slate-400" aria-live="polite">
          {status === 'uploading' && 'Uploading…'}
          {status === 'queued' && 'Offline: will send when back online.'}
          {status === 'complete' && 'Shared!'}
          {status === 'error' && 'Share failed.'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleBeginnerMode} className={buttonBase} aria-pressed={beginnerMode}>
          {beginnerMode ? 'Beginner Mode' : 'More Detail'}
        </button>
        <button onClick={toggleLanguageStyle} className={buttonBase}>
          Language: {languageStyle === 'simple' ? 'Simple' : 'Detailed'}
        </button>
        <span className="rounded bg-slate-900 px-2 py-1 text-xs text-slate-400" aria-live="polite">
          Auto-update On
        </span>
      </div>
    </header>
  );
};
