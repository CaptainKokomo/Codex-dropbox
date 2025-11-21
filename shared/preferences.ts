export interface UserPreferences {
  saveFolder?: string;
  autoUpdateEnabled: boolean;
  onboardingCompleted: boolean;
  tourCompleted: boolean;
}

export const defaultPreferences: UserPreferences = {
  autoUpdateEnabled: true,
  onboardingCompleted: false,
  tourCompleted: false,
};

export interface TelemetryEvent {
  type: 'wizard-step-enter' | 'wizard-step-exit' | 'wizard-complete' | 'tour-complete';
  step?: string;
  timestamp: string;
}
