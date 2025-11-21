import { ComponentDefinition, PluginManifest } from '@shared/types';

const baseComponents: ComponentDefinition[] = [
  {
    id: 'battery-9v',
    name: 'Battery',
    description: 'Provides a steady voltage source',
    category: 'Power',
    icon: 'battery',
    defaultValues: { voltage: 9 },
    editableFields: [
      { key: 'voltage', label: 'Voltage (V)', type: 'number', min: 1, max: 12 }
    ],
    nodes: [
      { id: 'positive', label: '+', polarity: '+', position: { x: 50, y: 0 } },
      { id: 'negative', label: '-', polarity: '-', position: { x: -50, y: 0 } }
    ]
  },
  {
    id: 'resistor-330',
    name: 'Resistor',
    description: 'Limits current flow',
    category: 'Passive',
    icon: 'resistor',
    defaultValues: { resistance: 330 },
    editableFields: [
      { key: 'resistance', label: 'Resistance (Ω)', type: 'number', min: 10, max: 100000 }
    ],
    nodes: [
      { id: 'left', label: 'In', position: { x: -50, y: 0 } },
      { id: 'right', label: 'Out', position: { x: 50, y: 0 } }
    ]
  },
  {
    id: 'led-red',
    name: 'LED',
    description: 'Lights when current flows',
    category: 'Active',
    icon: 'led',
    defaultValues: { color: 'red' },
    editableFields: [
      {
        key: 'color',
        label: 'Color',
        type: 'select',
        options: [
          { label: 'Red', value: 'red' },
          { label: 'Green', value: 'green' },
          { label: 'Blue', value: 'blue' }
        ]
      }
    ],
    nodes: [
      { id: 'anode', label: 'Anode', polarity: '+', position: { x: -40, y: 0 } },
      { id: 'cathode', label: 'Cathode', polarity: '-', position: { x: 40, y: 0 } }
    ]
  },
  {
    id: 'timer-555',
    name: 'Timer 555',
    description: 'Generates pulses for blinking circuits',
    category: 'IC',
    icon: 'timer',
    defaultValues: { frequency: 2 },
    editableFields: [
      { key: 'frequency', label: 'Frequency (Hz)', type: 'number', min: 0.5, max: 1000 }
    ],
    nodes: [
      { id: 'vcc', label: 'VCC', polarity: '+', position: { x: -50, y: -20 } },
      { id: 'gnd', label: 'GND', polarity: '-', position: { x: -50, y: 20 } },
      { id: 'out', label: 'OUT', position: { x: 50, y: 0 } }
    ]
  }
];

const pluginComponents: ComponentDefinition[] = [];

export const componentRegistry: Record<string, ComponentDefinition> = {};

const manifests: PluginManifest[] = [];

[...baseComponents, ...pluginComponents].forEach((component) => {
  componentRegistry[component.id] = component;
});

export const registerPlugin = (manifest: PluginManifest) => {
  manifests.push(manifest);
  manifest.components.forEach((component) => {
    componentRegistry[component.id] = component;
  });
};

export const listPlugins = () => manifests;
