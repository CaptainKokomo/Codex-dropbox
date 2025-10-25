import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { usePreferences } from './state/preferencesStore';
import { useTutorial } from './state/tutorialStore';
import { BlinkTutorial } from './tutorials/blink';

const App = () => {
  const { hydratePreferences } = usePreferences();
  const { ensureIntroComplete } = useTutorial();

  useEffect(() => {
    hydratePreferences();
    ensureIntroComplete();
  }, [hydratePreferences, ensureIntroComplete]);

  return <AppShell tutorial={<BlinkTutorial />} />;
};

export default App;
