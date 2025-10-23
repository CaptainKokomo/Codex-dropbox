import type { GamifiedMission } from '@state/types';
import { selectActiveProject, useNodeLabStore } from '@state/store';

export const missions: GamifiedMission[] = [
  {
    id: 'mission-intro-blink',
    title: 'Blink Party',
    description: 'Build your first blinking LED circuit faster than a heartbeat.',
    reward: 'Glow Gloves (cosmetic)',
    prerequisites: [],
    steps: [
      {
        id: 'drop-battery',
        instruction: 'Drag a Battery from the palette onto the canvas.',
        hint: 'Find the Battery under Power. Drop it near the top left of the grid.',
        successCheck: (state) => {
          const project = selectActiveProject(state);
          return project?.components.some((component) => component.type === 'battery') ?? false;
        }
      },
      {
        id: 'wire-led',
        instruction: 'Add an LED and connect it to the battery with a resistor in between.',
        hint: 'Wire Battery + → Resistor → LED → Battery -. The wire glows when connected.',
        successCheck: (state) => {
          const project = selectActiveProject(state);
          if (!project) return false;
          const hasLed = project.components.some((component) => component.type === 'led');
          const hasResistor = project.components.some((component) => component.type === 'resistor');
          return hasLed && hasResistor;
        }
      },
      {
        id: 'start-simulation',
        instruction: 'Hit Run and watch the LED pulse.',
        hint: 'Use the top bar controls. Pause anytime.',
        successCheck: (state) => Boolean(state.simulation)
      }
    ]
  },
  {
    id: 'mission-precision',
    title: 'Tuned Pulse',
    description: 'Dial in a steady 1 Hz blink using a potentiometer.',
    reward: 'Scope Skin: Aurora',
    prerequisites: ['mission-intro-blink'],
    steps: [
      {
        id: 'add-potentiometer',
        instruction: 'Add a potentiometer and wire it into your timing network.',
        hint: 'Try replacing the resistor with a potentiometer. Drag terminals to connect.',
        successCheck: (state) => {
          const project = selectActiveProject(state);
          return project?.components.some((component) => component.type === 'potentiometer') ?? false;
        }
      },
      {
        id: 'tune-frequency',
        instruction: 'Adjust the knob until the oscilloscope shows about 1 Hz.',
        hint: 'Use the bottom scope controls. Watch the highlighted frequency label.',
        successCheck: (state) => {
          const frequency = state.simulation?.metadata?.frequency ?? 0;
          return Math.abs(frequency - 1) < 0.2;
        }
      }
    ]
  }
];

export function getActiveMission() {
  const { gamifiedProgress } = useNodeLabStore.getState();
  if (!gamifiedProgress.activeMissionId) {
    return missions[0];
  }
  return missions.find((mission) => mission.id === gamifiedProgress.activeMissionId) ?? missions[0];
}
