import { nanoid } from 'nanoid';
import { ProjectState, TutorialState } from '@shared/types';

const steps: TutorialState[] = [
  {
    stepId: 'welcome',
    completed: false,
    overlayMessage: 'Welcome to NodeLab! Drag a battery onto the canvas to start.'
  },
  {
    stepId: 'connect-led',
    completed: false,
    overlayMessage: 'Wire the battery, resistor, and LED together to blink.'
  },
  {
    stepId: 'start-sim',
    completed: false,
    overlayMessage: 'Press Run to see the LED blink. Adjust values via right-click.'
  }
];

export const tutorialFlow = {
  initialState: {
    stepId: steps[0].stepId,
    completed: false,
    overlayMessage: steps[0].overlayMessage
  } as TutorialState,
  bootstrap: (
    set: (updater: (draft: ProjectState) => void) => void,
    get: () => ProjectState
  ) => {
    set((draft: ProjectState) => {
      draft.guidance = { messages: [] };
    });
    window.addEventListener('nodelab-tutorial-progress', (event: Event) => {
      const detail = (event as CustomEvent).detail as { stepId: string };
      const idx = steps.findIndex((step) => step.stepId === detail.stepId);
      if (idx >= 0) {
        const next = steps[idx + 1];
        set((draft: ProjectState) => {
          draft.tutorialState.stepId = detail.stepId;
          draft.tutorialState.completed = idx === steps.length - 1;
          draft.tutorialState.overlayMessage = next ? next.overlayMessage : undefined;
        });
      }
    });
  }
};

export const emitTutorialProgress = (stepId: string) => {
  window.dispatchEvent(
    new CustomEvent('nodelab-tutorial-progress', {
      detail: { stepId, id: nanoid() }
    })
  );
};
