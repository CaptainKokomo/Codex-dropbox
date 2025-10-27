import { nanoid } from 'nanoid';
import type { ComponentInstance, ComponentKind, NodeAnchor } from './circuitTypes';

interface ComponentDefinition {
  kind: ComponentKind;
  label: string;
  defaultValue: string;
  description: string;
  nodeLayout: NodeAnchor[];
}

export const componentLibrary: ComponentDefinition[] = [
  {
    kind: 'battery',
    label: 'Battery',
    defaultValue: '9 V',
    description: 'Provides a DC voltage source.',
    nodeLayout: [
      { id: 'positive', label: '+', position: { x: -32, y: 0 } },
      { id: 'negative', label: '-', position: { x: 32, y: 0 } }
    ]
  },
  {
    kind: 'resistor',
    label: 'Resistor',
    defaultValue: '330 Ω',
    description: 'Limits current to protect components.',
    nodeLayout: [
      { id: 'a', label: 'A', position: { x: -28, y: 0 } },
      { id: 'b', label: 'B', position: { x: 28, y: 0 } }
    ]
  },
  {
    kind: 'led',
    label: 'LED',
    defaultValue: 'Red',
    description: 'Light emitting diode. Needs correct polarity.',
    nodeLayout: [
      { id: 'anode', label: '+', position: { x: -26, y: 0 } },
      { id: 'cathode', label: '-', position: { x: 26, y: 0 } }
    ]
  },
  {
    kind: 'diode',
    label: 'Diode',
    defaultValue: '1N4148',
    description: 'One-way valve for current flow.',
    nodeLayout: [
      { id: 'anode', label: '+', position: { x: -24, y: 0 } },
      { id: 'cathode', label: '-', position: { x: 24, y: 0 } }
    ]
  },
  {
    kind: 'npn-transistor',
    label: 'NPN Transistor',
    defaultValue: '2N3904',
    description: 'Switch or amplifier controlled by a small base current.',
    nodeLayout: [
      { id: 'collector', label: 'C', position: { x: -24, y: -12 } },
      { id: 'base', label: 'B', position: { x: 0, y: 18 } },
      { id: 'emitter', label: 'E', position: { x: 24, y: -12 } }
    ]
  },
  {
    kind: 'mosfet',
    label: 'MOSFET',
    defaultValue: 'IRLZ44N',
    description: 'Voltage-driven transistor ideal for switching loads.',
    nodeLayout: [
      { id: 'drain', label: 'D', position: { x: -26, y: -12 } },
      { id: 'gate', label: 'G', position: { x: 0, y: 18 } },
      { id: 'source', label: 'S', position: { x: 26, y: -12 } }
    ]
  },
  {
    kind: 'potentiometer',
    label: 'Potentiometer',
    defaultValue: '10 kΩ',
    description: 'Adjustable resistor for tuning brightness and timing.',
    nodeLayout: [
      { id: 'a', label: 'A', position: { x: -28, y: -12 } },
      { id: 'wiper', label: 'W', position: { x: 0, y: 18 } },
      { id: 'b', label: 'B', position: { x: 28, y: -12 } }
    ]
  },
  {
    kind: 'timer-555',
    label: '555 Timer',
    defaultValue: 'Astable',
    description: 'Versatile timing IC for blinkers and pulses.',
    nodeLayout: [
      { id: 'vcc', label: 'VCC', position: { x: -40, y: -24 } },
      { id: 'trig', label: 'TR', position: { x: -40, y: -8 } },
      { id: 'out', label: 'OUT', position: { x: 40, y: -8 } },
      { id: 'rst', label: 'RST', position: { x: -40, y: 8 } },
      { id: 'ctrl', label: 'CV', position: { x: 40, y: 8 } },
      { id: 'thresh', label: 'TH', position: { x: -40, y: 24 } },
      { id: 'dis', label: 'DIS', position: { x: 40, y: 24 } },
      { id: 'gnd', label: 'GND', position: { x: 0, y: 40 } }
    ]
  },
  {
    kind: 'capacitor',
    label: 'Capacitor',
    defaultValue: '10 µF',
    description: 'Stores charge to smooth or delay signals.',
    nodeLayout: [
      { id: 'a', label: '+', position: { x: -24, y: 0 } },
      { id: 'b', label: '-', position: { x: 24, y: 0 } }
    ]
  },
  {
    kind: 'dc-source',
    label: 'DC Source',
    defaultValue: '5 V',
    description: 'Adjustable DC supply.',
    nodeLayout: [
      { id: 'positive', label: '+', position: { x: -32, y: 0 } },
      { id: 'negative', label: '-', position: { x: 32, y: 0 } }
    ]
  },
  {
    kind: 'pushbutton',
    label: 'Pushbutton',
    defaultValue: 'Momentary',
    description: 'Momentary switch for user input.',
    nodeLayout: [
      { id: 'a', label: 'A', position: { x: -22, y: -8 } },
      { id: 'b', label: 'B', position: { x: -22, y: 8 } },
      { id: 'c', label: 'C', position: { x: 22, y: -8 } },
      { id: 'd', label: 'D', position: { x: 22, y: 8 } }
    ]
  },
  {
    kind: 'speaker',
    label: 'Buzzer',
    defaultValue: 'Tone',
    description: 'Plays sound when driven.',
    nodeLayout: [
      { id: 'positive', label: '+', position: { x: -26, y: 0 } },
      { id: 'negative', label: '-', position: { x: 26, y: 0 } }
    ]
  }
];

export function instantiateComponent(kind: ComponentKind, position: { x: number; y: number }): ComponentInstance {
  const def = componentLibrary.find((item) => item.kind === kind);
  if (!def) {
    throw new Error(`Unknown component kind: ${kind}`);
  }
  return {
    id: nanoid(),
    kind,
    name: def.label,
    position,
    rotation: 0,
    nodes: def.nodeLayout.map((node) => ({ ...node, id: `${node.id}-${nanoid(4)}` })),
    value: def.defaultValue
  };
}
