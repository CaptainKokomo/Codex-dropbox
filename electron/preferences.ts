import Store from 'electron-store';
import { defaultPreferences, type TelemetryEvent, type UserPreferences } from '../shared/preferences.js';

const preferencesStore = new Store<UserPreferences>({
  name: 'preferences',
  defaults: defaultPreferences,
});

const telemetryStore = new Store<{ events: TelemetryEvent[] }>({
  name: 'telemetry',
  defaults: { events: [] },
});

export function getPreferences(): UserPreferences {
  return preferencesStore.store;
}

export function updatePreferences(update: Partial<UserPreferences>): UserPreferences {
  const next = { ...preferencesStore.store, ...update } as UserPreferences;
  preferencesStore.store = next;
  return next;
}

export function appendTelemetry(event: TelemetryEvent) {
  const events = telemetryStore.get('events');
  telemetryStore.set('events', [...events, event]);
}

export function clearTelemetry() {
  telemetryStore.set('events', []);
}
