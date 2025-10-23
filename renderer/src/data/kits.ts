import type { CircuitKitReference } from '@state/types';

export const starterKits: CircuitKitReference[] = [
  {
    id: 'kit-starter-led',
    title: 'Starter LED Playground',
    contents: [
      { componentType: 'battery', quantity: 1, notes: '5 V USB pack or AA holder' },
      { componentType: 'resistor', quantity: 5, notes: 'Assorted 220–1k Ω' },
      { componentType: 'led', quantity: 5, notes: 'Red, Green, Blue, Yellow, White' },
      { componentType: 'button', quantity: 2 },
      { componentType: 'timer555', quantity: 1 },
      { componentType: 'capacitor', quantity: 3, notes: '10 µF, 100 µF, 1 µF' }
    ],
    tags: ['beginner', 'guided'],
    isGamified: true
  },
  {
    id: 'kit-audio-beeps',
    title: 'Beep & Buzz Lab',
    contents: [
      { componentType: 'speaker', quantity: 1 },
      { componentType: 'mosfet', quantity: 1 },
      { componentType: 'timer555', quantity: 1 },
      { componentType: 'potentiometer', quantity: 2, notes: '10 kΩ and 100 kΩ' }
    ],
    tags: ['audio', 'intermediate']
  }
];
