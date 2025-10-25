import { PropsWithChildren, useMemo } from 'react';
import { useTutorial } from '../state/tutorialStore';

export const TutorialCoach = ({ children }: PropsWithChildren) => {
  const { steps, currentStep, goToNextStep } = useTutorial();

  const activeStep = useMemo(() => steps[currentStep], [steps, currentStep]);

  if (!activeStep) {
    return null;
  }

  return (
    <aside
      className="w-80 border-l border-slate-800 bg-panel px-4 py-6"
      aria-label="Tutorial coach"
    >
      <h2 className="text-lg font-semibold text-slate-100">{activeStep.title}</h2>
      <p className="mt-2 text-sm text-slate-300">{activeStep.description}</p>
      {children}
      <button
        onClick={goToNextStep}
        className="mt-4 w-full rounded-md bg-accent/20 px-3 py-2 text-sm font-semibold text-accent hover:bg-accent/30"
      >
        {currentStep + 1 >= steps.length ? 'Finish Tour' : 'Next Tip'}
      </button>
    </aside>
  );
};
