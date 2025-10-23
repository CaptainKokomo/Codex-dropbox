import { useGamifiedTutorial } from '@hooks/useGamifiedTutorial';
import { missions } from '@data/missions';
import { blinkTutorial } from '@data/tutorials';

interface GamifiedCoachProps {
  onOpenSettings: () => void;
}

export function GamifiedCoach({ onOpenSettings }: GamifiedCoachProps) {
  const { activeMission, completedSteps, showTips } = useGamifiedTutorial();
  const currentStep = activeMission.steps.find((step) => !completedSteps.includes(step.id));
  const missionIndex = missions.findIndex((mission) => mission.id === activeMission.id);
  const progress = (completedSteps.length / activeMission.steps.length) * 100;

  return (
    <div className="gamified-coach">
      <div className="coach-header">
        <h4>Quest {missionIndex + 1}: {activeMission.title}</h4>
        <button onClick={onOpenSettings} className="coach-settings">Settings</button>
      </div>
      <div className="coach-progress">
        <div className="coach-progress-bar">
          <div className="coach-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{Math.round(progress)}% complete</span>
      </div>
      {currentStep ? (
        <div className="coach-step">
          <h5>Next move</h5>
          <p>{currentStep.instruction}</p>
          {showTips && <em>{currentStep.hint}</em>}
        </div>
      ) : (
        <div className="coach-step">
          <h5>Mission accomplished!</h5>
          <p>{activeMission.reward}</p>
        </div>
      )}
      <div className="coach-footer">
        <button className="coach-link" onClick={() => onOpenSettings()}>
          Toggle advanced sandbox
        </button>
        <button
          className="coach-link"
          onClick={() => {
            void window.NodeLab?.openLink('https://nodelab.app/tutorials/' + blinkTutorial.id);
          }}
        >
          Play the Blink tour again
        </button>
      </div>
    </div>
  );
}
