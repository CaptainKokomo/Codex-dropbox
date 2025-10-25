import { useEffect } from 'react';
import { useTutorial } from '../state/tutorialStore';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to NodeLab',
    description: 'Drop parts onto the board, wire them up, and press Run to see the magic.',
  },
  {
    id: 'battery',
    title: 'Step 1 — Power',
    description: 'Drag a Battery onto the canvas. Its + and - are labeled clearly.',
  },
  {
    id: 'resistor',
    title: 'Step 2 — Resistor',
    description: 'Add a 330 Ω resistor between the battery + and LED to keep things safe.',
  },
  {
    id: 'led',
    title: 'Step 3 — LED',
    description: 'Drop an LED. Make sure + connects to the resistor and - to ground.',
  },
  {
    id: 'timer',
    title: 'Step 4 — Blink it',
    description: 'Add the 555 prefab and wire its OUT to the LED. Hit Run and watch the blink.',
  },
];

export const BlinkTutorial = () => {
  const { registerSteps } = useTutorial();

  useEffect(() => {
    registerSteps(steps);
  }, [registerSteps]);

  return null;
};
