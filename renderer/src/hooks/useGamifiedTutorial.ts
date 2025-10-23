import { useEffect, useMemo } from 'react';
import { missions } from '@data/missions';
import { useNodeLabStore } from '@state/store';

export function useGamifiedTutorial() {
  const {
    gamifiedProgress,
    updateGamifiedProgress,
    diagnostics,
    simulation,
    showTips
  } = useNodeLabStore((state) => ({
    gamifiedProgress: state.gamifiedProgress,
    updateGamifiedProgress: state.updateGamifiedProgress,
    diagnostics: state.diagnostics,
    simulation: state.simulation,
    showTips: state.showTips
  }));

  const activeMission = useMemo(() => {
    if (!gamifiedProgress.activeMissionId) {
      return missions[0];
    }
    return missions.find((mission) => mission.id === gamifiedProgress.activeMissionId) ?? missions[0];
  }, [gamifiedProgress.activeMissionId]);

  useEffect(() => {
    if (!activeMission) return;

    const currentProjectState = useNodeLabStore.getState();

    const completedSteps = gamifiedProgress.stepCompleted[activeMission.id] ?? [];
    const nextStep = activeMission.steps.find((step) => !completedSteps.includes(step.id));

    if (!nextStep) {
      if (!gamifiedProgress.completedMissions.includes(activeMission.id)) {
        updateGamifiedProgress({
          completedMissions: [...gamifiedProgress.completedMissions, activeMission.id],
          experience: gamifiedProgress.experience + 50,
          level: Math.floor((gamifiedProgress.experience + 50) / 100) + 1,
          activeMissionId: findNextMissionId(activeMission.id)
        });
      }
      return;
    }

    const success = nextStep.successCheck(currentProjectState);
    if (success) {
      updateGamifiedProgress({
        stepCompleted: {
          ...gamifiedProgress.stepCompleted,
          [activeMission.id]: [...completedSteps, nextStep.id]
        }
      });
    }
  }, [activeMission, gamifiedProgress, updateGamifiedProgress, diagnostics, simulation]);

  return {
    showTips,
    activeMission,
    completedSteps: gamifiedProgress.stepCompleted[activeMission?.id ?? ''] ?? []
  };
}

function findNextMissionId(currentMissionId: string): string | null {
  const index = missions.findIndex((mission) => mission.id === currentMissionId);
  if (index === -1) return null;
  return missions[index + 1]?.id ?? null;
}
