import React, { useEffect, useMemo, useState } from 'react';
import { usePreferencesStore } from '../../state/preferences.js';

const TOUR_STEPS = [
  {
    id: 'bench-overview',
    title: 'Your Workbench',
    body: 'Center stage is the virtual breadboard—drag parts here to build live circuits.',
  },
  {
    id: 'parts-tray',
    title: 'Parts Tray',
    body: 'Everything you need sits on the left: batteries, resistors, LEDs, chips, and prefab helpers.',
  },
  {
    id: 'inspector',
    title: 'Inspector',
    body: 'On the right, tweak values in plain language. Right-click any part later to adjust it instantly.',
  },
  {
    id: 'instruments',
    title: 'Meters & Scope',
    body: 'Down below, keep tabs on voltage, current, and waveforms without touching a command line.',
  },
];

export const GuidedTourOverlay: React.FC = () => {
  const tourActive = usePreferencesStore((state) => state.wizard.tourActive);
  const markTourComplete = usePreferencesStore((state) => state.markTourComplete);
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (tourActive) {
      setVisible(true);
      setCurrent(0);
    } else {
      setVisible(false);
    }
  }, [tourActive]);

  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(() => {
      if (current + 1 >= TOUR_STEPS.length) {
        setVisible(false);
        void markTourComplete();
      } else {
        setCurrent((prev) => prev + 1);
      }
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [current, visible, markTourComplete]);

  const step = useMemo(() => TOUR_STEPS[current], [current]);

  if (!visible || !step) {
    return null;
  }

  return (
    <div className="tour-overlay" role="dialog" aria-live="polite">
      <div className="tour-card">
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <div className="tour-progress">
          {TOUR_STEPS.map((tourStep, index) => (
            <span key={tourStep.id} className={index <= current ? 'active' : ''} />
          ))}
        </div>
      </div>
    </div>
  );
};
