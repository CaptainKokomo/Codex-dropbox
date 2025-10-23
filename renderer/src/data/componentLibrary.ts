import type { CircuitComponent } from '@state/types';
import { nanoid } from 'nanoid/non-secure';

export const componentLibrary: CircuitComponent[] = [
  {
    id: nanoid(),
    type: 'battery',
    name: 'Battery',
    description: 'Provides steady DC voltage to power your circuit.',
    category: 'power',
    terminals: [
      { id: 'pos', label: '+', polarity: '+', position: { x: -20, y: 0 } },
      { id: 'neg', label: '-', polarity: '-', position: { x: 20, y: 0 } }
    ],
    value: '5 V',
    editableValues: [
      {
        key: 'voltage',
        label: 'Voltage',
        unit: 'V',
        min: 1,
        max: 12,
        step: 0.5,
        defaultValue: 5
      }
    ],
    metadata: { recommendedRange: '3–12 V', beginnerTip: 'Start at 5 V for LED circuits.' }
  },
  {
    id: nanoid(),
    type: 'resistor',
    name: 'Resistor',
    description: 'Limits current so parts stay safe and happy.',
    category: 'passive',
    terminals: [
      { id: 'a', label: 'A', polarity: 'input', position: { x: -24, y: 0 } },
      { id: 'b', label: 'B', polarity: 'output', position: { x: 24, y: 0 } }
    ],
    value: '330 Ω',
    editableValues: [
      {
        key: 'resistance',
        label: 'Resistance',
        unit: 'Ω',
        min: 1,
        max: 1000000,
        step: 10,
        defaultValue: 330
      }
    ],
    metadata: { warnsWhenMissing: true }
  },
  {
    id: nanoid(),
    type: 'led',
    name: 'LED',
    description: 'Light-emitting diode. Glows when current flows forward.',
    category: 'io',
    terminals: [
      { id: 'anode', label: '+', polarity: '+', position: { x: -16, y: 0 } },
      { id: 'cathode', label: '-', polarity: '-', position: { x: 16, y: 0 } }
    ],
    value: 'Red',
    editableValues: [
      {
        key: 'forwardVoltage',
        label: 'Forward Voltage',
        unit: 'V',
        min: 1.8,
        max: 3.3,
        step: 0.1,
        defaultValue: 2
      }
    ],
    metadata: { requiresPolarity: true }
  },
  {
    id: nanoid(),
    type: 'button',
    name: 'Pushbutton',
    description: 'Momentary switch that closes while you press it.',
    category: 'io',
    terminals: [
      { id: 'left', label: '1', polarity: 'input', position: { x: -16, y: -12 } },
      { id: 'right', label: '2', polarity: 'output', position: { x: 16, y: -12 } },
      { id: 'left2', label: '3', polarity: 'input', position: { x: -16, y: 12 } },
      { id: 'right2', label: '4', polarity: 'output', position: { x: 16, y: 12 } }
    ]
  },
  {
    id: nanoid(),
    type: 'timer555',
    name: '555 Timer',
    description: 'Classic timer chip for oscillators and pulse circuits.',
    category: 'active',
    terminals: [
      { id: 'vcc', label: 'VCC', polarity: '+', position: { x: -32, y: -24 } },
      { id: 'gnd', label: 'GND', polarity: '-', position: { x: 32, y: -24 } },
      { id: 'trig', label: 'TRIG', polarity: 'input', position: { x: -32, y: -8 } },
      { id: 'out', label: 'OUT', polarity: 'output', position: { x: 32, y: -8 } },
      { id: 'reset', label: 'RESET', polarity: 'control', position: { x: -32, y: 8 } },
      { id: 'ctrl', label: 'CTRL', polarity: 'control', position: { x: 32, y: 8 } },
      { id: 'thresh', label: 'THR', polarity: 'input', position: { x: -32, y: 24 } },
      { id: 'dis', label: 'DIS', polarity: 'output', position: { x: 32, y: 24 } }
    ],
    metadata: {
      prefabRecipe: 'astable-blinker',
      beginnerTip: 'Use the prefab to auto-wire a blinking LED in seconds.'
    }
  },
  {
    id: nanoid(),
    type: 'prefab-555-blinker',
    name: 'Blinking LED (555)',
    description: 'Ready-made astable 555 circuit that blinks an LED around 2 Hz.',
    category: 'prefab',
    terminals: [
      { id: 'power+', label: '+', polarity: '+', position: { x: -48, y: -24 } },
      { id: 'power-', label: '-', polarity: '-', position: { x: 48, y: -24 } },
      { id: 'led+', label: 'LED+', polarity: '+', position: { x: -48, y: 24 } },
      { id: 'led-', label: 'LED-', polarity: '-', position: { x: 48, y: 24 } }
    ],
    prefab: true,
    metadata: {
      lockedComponents: ['555 timer', 'resistor', 'capacitor'],
      explanation: 'Prefabs wire the tricky parts automatically so you can learn by tweaking.'
    }
  }
];

export const customisableComponentKeys = ['resistor', 'led', 'battery', 'timer555', 'mosfet', 'transistor', 'prefab-555-blinker'];
