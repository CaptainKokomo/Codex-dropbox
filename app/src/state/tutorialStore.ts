import { create } from 'zustand';

type TutorialStep = {
  id: string;
  title: string;
  description: string;
};

type TutorialState = {
  steps: TutorialStep[];
  currentStep: number;
  registerSteps: (steps: TutorialStep[]) => void;
  ensureIntroComplete: () => void;
  goToNextStep: () => void;
};

export const useTutorial = create<TutorialState>((set, get) => ({
  steps: [],
  currentStep: 0,
  registerSteps: (steps) => set({ steps, currentStep: 0 }),
  ensureIntroComplete: () => {
    const { steps } = get();
    if (steps.length === 0) {
      set({ currentStep: 0 });
    }
  },
  goToNextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep + 1 >= steps.length) {
      set({ currentStep: steps.length });
    } else {
      set({ currentStep: currentStep + 1 });
    }
  },
}));
