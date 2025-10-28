import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { UserPreferences } from '../../shared/preferences.js';

export interface WizardState {
  currentStepIndex: number;
  completed: boolean;
  tourActive: boolean;
  steps: WizardStep[];
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
}

type PreferencesStore = {
  preferences: UserPreferences | null;
  wizard: WizardState;
  loading: boolean;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreferences: (update: Partial<UserPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
  advanceStep: () => Promise<void>;
  goToStep: (index: number) => void;
  markTourComplete: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

const defaultSteps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to NodeLab',
    description:
      'We keep things friendly and hands-on. Choose a safe place to save your projects and we will guide you every step of the way.',
    ctaLabel: 'Let’s get started',
  },
  {
    id: 'save-folder',
    title: 'Pick your project home',
    description: 'Select the folder where NodeLab will store your circuits and tutorials.',
    ctaLabel: 'Choose folder',
  },
  {
    id: 'auto-update',
    title: 'Updates, your call',
    description: 'NodeLab can keep itself updated. Toggle it on or off—either way, everything runs offline.',
    ctaLabel: 'Save my choice',
  },
  {
    id: 'tour',
    title: 'Quick tour',
    description: 'Take a 10-second walk-through of the workbench so you always know where to reach.',
    ctaLabel: 'Start tour',
  },
];

export const usePreferencesStore = create<PreferencesStore>()(
  immer((set, get) => ({
    preferences: null,
    loading: false,
    wizard: {
      currentStepIndex: 0,
      completed: false,
      tourActive: false,
      steps: defaultSteps,
    },
    setPreferences: (prefs) => {
      set((state) => {
        state.preferences = prefs;
      });
    },
    updatePreferences: async (update) => {
      const next = await window.nodelab.updatePreferences(update);
      set((state) => {
        state.preferences = next;
      });
    },
    loadPreferences: async () => {
      set((state) => {
        state.loading = true;
      });
      const prefs = await window.nodelab.getPreferences();
      set((state) => {
        state.preferences = prefs;
        state.loading = false;
        state.wizard.completed = prefs.onboardingCompleted;
        state.wizard.tourActive = !prefs.tourCompleted && prefs.onboardingCompleted;
        state.wizard.currentStepIndex = prefs.onboardingCompleted ? state.wizard.steps.length - 1 : 0;
      });
    },
    advanceStep: async () => {
      const { wizard, preferences } = get();
      const nextIndex = wizard.currentStepIndex + 1;
      if (nextIndex >= wizard.steps.length) {
        const nextPrefs = await window.nodelab.updatePreferences({ onboardingCompleted: true });
        set((state) => {
          state.preferences = nextPrefs;
          state.wizard.completed = true;
          state.wizard.tourActive = true;
        });
        await window.nodelab.recordTelemetry({
          type: 'wizard-complete',
          timestamp: new Date().toISOString(),
        });
        return;
      }
      set((state) => {
        state.wizard.currentStepIndex = nextIndex;
      });
      await window.nodelab.recordTelemetry({
        type: 'wizard-step-enter',
        step: wizard.steps[nextIndex].id,
        timestamp: new Date().toISOString(),
      });
      if (preferences && !preferences.onboardingCompleted && nextIndex === wizard.steps.length - 1) {
        const nextPrefs = await window.nodelab.updatePreferences({ onboardingCompleted: true });
        set((state) => {
          state.preferences = nextPrefs;
        });
      }
    },
    goToStep: (index) => {
      set((state) => {
        state.wizard.currentStepIndex = index;
      });
    },
    resetOnboarding: async () => {
      const nextPrefs = await window.nodelab.updatePreferences({ onboardingCompleted: false, tourCompleted: false });
      set((state) => {
        state.preferences = nextPrefs;
        state.wizard.currentStepIndex = 0;
        state.wizard.completed = false;
        state.wizard.tourActive = false;
      });
      await window.nodelab.recordTelemetry({
        type: 'wizard-step-enter',
        step: 'welcome',
        timestamp: new Date().toISOString(),
      });
    },
    markTourComplete: async () => {
      const nextPrefs = await window.nodelab.updatePreferences({ tourCompleted: true });
      set((state) => {
        state.preferences = nextPrefs;
        state.wizard.tourActive = false;
      });
      await window.nodelab.recordTelemetry({
        type: 'tour-complete',
        timestamp: new Date().toISOString(),
      });
    },
  })),
);
