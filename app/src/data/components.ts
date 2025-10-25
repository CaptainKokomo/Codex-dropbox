import { useMemo } from 'react';
import { usePluginRegistry } from '../plugins/pluginRegistry';

export type ComponentValue = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

export type ComponentNode = {
  id: string;
  label: string;
  hint?: string;
  position: { x: number; y: number };
};

export type ComponentBlueprint = {
  type: string;
  label: string;
  icon?: string;
  category?: string;
  simpleDescription: string;
  detailedDescription: string;
  dimensions: { width: number; height: number };
  values: ComponentValue[];
  nodes: ComponentNode[];
};

const baseComponents: ComponentBlueprint[] = [
  {
    type: 'battery',
    label: 'Battery',
    category: 'Sources',
    simpleDescription: '+ and – power source',
    detailedDescription: 'DC voltage source with positive and negative terminals',
    dimensions: { width: 150, height: 60 },
    values: [
      { id: 'voltage', label: 'Voltage', value: '5', hint: 'Try 5 V for LEDs' },
    ],
    nodes: [
      { id: 'positive', label: '+', hint: 'Positive terminal', position: { x: 150, y: 30 } },
      { id: 'negative', label: '-', hint: 'Negative terminal', position: { x: 0, y: 30 } },
    ],
  },
  {
    type: 'resistor',
    label: 'Resistor',
    category: 'Core',
    simpleDescription: 'Limits current',
    detailedDescription: 'Two-terminal resistor used to limit current',
    dimensions: { width: 120, height: 48 },
    values: [
      { id: 'resistance', label: 'Resistance (Ω)', value: '330', hint: '330 Ω keeps LEDs safe' },
    ],
    nodes: [
      { id: 'left', label: '-', hint: 'Connect toward ground', position: { x: 0, y: 24 } },
      { id: 'right', label: '+', hint: 'Connect toward supply', position: { x: 120, y: 24 } },
    ],
  },
  {
    type: 'led',
    label: 'LED',
    category: 'Indicators',
    simpleDescription: 'Lights up when current flows',
    detailedDescription: 'Polarized diode that emits light when forward biased',
    dimensions: { width: 100, height: 48 },
    values: [
      { id: 'color', label: 'Color', value: 'Red', hint: 'Red is easiest to start with' },
    ],
    nodes: [
      { id: 'anode', label: '+', hint: 'Anode (long leg)', position: { x: 100, y: 24 } },
      { id: 'cathode', label: '-', hint: 'Cathode (short leg)', position: { x: 0, y: 24 } },
    ],
  },
  {
    type: 'timer555',
    label: '555 Timer',
    category: 'Prefabs',
    simpleDescription: 'Timing chip for blinkers',
    detailedDescription: 'Versatile timer that generates pulses and square waves',
    dimensions: { width: 180, height: 120 },
    values: [
      { id: 'mode', label: 'Mode', value: 'Astable', hint: 'Astable makes it blink' },
    ],
    nodes: [
      { id: 'vcc', label: '+V', hint: 'Connect to battery +', position: { x: 180, y: 20 } },
      { id: 'gnd', label: 'GND', hint: 'Connect to battery -', position: { x: 0, y: 20 } },
      { id: 'out', label: 'OUT', hint: 'Blinking output', position: { x: 180, y: 100 } },
    ],
  },
  {
    type: 'prefabBlinker',
    label: 'Blinker Prefab',
    category: 'Prefabs',
    simpleDescription: 'Ready-to-go LED blinker',
    detailedDescription: 'Prefab wiring for 555 blinker you can tweak',
    dimensions: { width: 220, height: 140 },
    values: [
      { id: 'frequency', label: 'Blink Speed (Hz)', value: '2', hint: '2 Hz ≈ two flashes per second' },
    ],
    nodes: [
      { id: 'input', label: '+', hint: 'Connect to supply +', position: { x: 220, y: 20 } },
      { id: 'output', label: '+', hint: 'Connect to LED anode', position: { x: 220, y: 120 } },
      { id: 'return', label: '-', hint: 'Connect to supply -', position: { x: 0, y: 70 } },
    ],
  },
];

export const useComponentCatalog = () => {
  const manifests = usePluginRegistry((state) => state.manifests);
  return useMemo(
    () => ({ components: [...baseComponents, ...manifests.flatMap((manifest) => manifest.components)] }),
    [manifests],
  );
};
