import { useCallback } from 'react';
import { useNodeLabStore, selectActiveProject } from '@state/store';

export function useProjectPersistence() {
  const getProject = () => {
    const state = useNodeLabStore.getState();
    return selectActiveProject(state);
  };

  const saveProject = useCallback(async () => {
    const project = getProject();
    if (!project) return;
    const payload = {
      fileName: `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`,
      data: JSON.stringify(project, null, 2)
    };
    await window.NodeLab?.saveProject(payload);
  }, []);

  const exportBlueprint = useCallback(async () => {
    const project = getProject();
    if (!project) return;
    const payload = {
      dialogTitle: `Export ${project.name} blueprint`,
      defaultPath: `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`,
      data: JSON.stringify(project.blueprint, null, 2)
    };
    await window.NodeLab?.exportFile(payload);
  }, []);

  return { saveProject, exportBlueprint };
}
