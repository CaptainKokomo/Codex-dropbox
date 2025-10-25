import { PropsWithChildren } from 'react';
import { TopBar } from './TopBar';
import { ComponentPalette } from './ComponentPalette';
import { CanvasWorkspace } from './CanvasWorkspace';
import { InspectorPanel } from './InspectorPanel';
import { DiagnosticsStrip } from './DiagnosticsStrip';
import { TutorialCoach } from './TutorialCoach';
import { useUI } from '../state/uiStore';
import { NodeEditorDialog } from './NodeEditorDialog';

interface AppShellProps {
  tutorial: React.ReactNode;
}

export const AppShell = ({ tutorial }: PropsWithChildren<AppShellProps>) => {
  const { beginnerMode } = useUI();

  return (
    <div className="flex h-screen w-screen bg-canvas text-slate-100">
      <div className="flex w-full flex-col">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-slate-800 bg-panel">
            <ComponentPalette />
          </aside>
          <main className="flex flex-1 flex-col">
            <div className="flex flex-1 overflow-hidden">
              <CanvasWorkspace />
              <InspectorPanel beginnerMode={beginnerMode} />
            </div>
            <DiagnosticsStrip />
          </main>
        </div>
      </div>
      <TutorialCoach>{tutorial}</TutorialCoach>
      <NodeEditorDialog />
    </div>
  );
};
