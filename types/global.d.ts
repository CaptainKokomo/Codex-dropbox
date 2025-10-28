import type { TelemetryEvent, UserPreferences } from '../shared/preferences.js';

declare global {
  interface Window {
    nodelab: {
      getPreferences: () => Promise<UserPreferences>;
      updatePreferences: (update: Partial<UserPreferences>) => Promise<UserPreferences>;
      chooseFolder: () => Promise<string | null>;
      recordTelemetry: (event: TelemetryEvent) => Promise<boolean>;
    };
  }
}

export {};
