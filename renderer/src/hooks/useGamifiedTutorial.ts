import { useEffect, useMemo } from 'react';
import { missions } from '@data/missions';
import { useNodeLabStore } from '@state/store';

export function useGamifiedTutorial() {
  const { gamifiedProgress, showTips } = useNodeLabStore((state) => ({
    gamifiedProgress: state.gamifiedProgress,
    showTips: state.showTips
  }));

  const activeMission = useMemo(() => {
    if (!gamifiedProgress.activeMissionId) {
      return missions[0];
    }
    return missions.find((mission) => mission.id === gamifiedProgress.activeMissionId) ?? missions[0];
  }, [gamifiedProgress.activeMissionId]);

  useEffect(() => {
    const evaluateMissionProgress = () => {
      const state = useNodeLabStore.getState();
      const progress = state.gamifiedProgress;

      const mission = progress.activeMissionId
        ? missions.find((item) => item.id === progress.activeMissionId) ?? missions[0]
        : missions[0];

      if (!mission) {
        return;
      }

      const completedSteps = progress.stepCompleted[mission.id] ?? [];
      const nextStep = mission.steps.find((step) => !completedSteps.includes(step.id));

      if (!nextStep) {
        if (!progress.completedMissions.includes(mission.id)) {
          const updatedExperience = progress.experience + 50;
          state.updateGamifiedProgress({
            completedMissions: [...progress.completedMissions, mission.id],
            experience: updatedExperience,
            level: Math.floor(updatedExperience / 100) + 1,
            activeMissionId: findNextMissionId(mission.id)
          });
        }
        return;
      }

      if (nextStep.successCheck(state)) {
        state.updateGamifiedProgress({
          stepCompleted: {
            ...progress.stepCompleted,
            [mission.id]: [...completedSteps, nextStep.id]
          }
        });
      }
    };

    const unsubscribe = useNodeLabStore.subscribe(evaluateMissionProgress);
    evaluateMissionProgress();

    return () => {
      unsubscribe();
    };
  }, []);

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
