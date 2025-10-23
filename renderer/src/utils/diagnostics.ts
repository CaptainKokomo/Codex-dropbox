import type { CircuitComponent, DiagnosticMessage, WireConnection } from '@state/types';

export function evaluateDiagnostics(
  components: CircuitComponent[],
  wires: WireConnection[],
  advancedMode: boolean
): DiagnosticMessage[] {
  const messages: DiagnosticMessage[] = [];

  const hasBattery = components.some((component) => component.type === 'battery');
  if (!hasBattery) {
    messages.push({
      id: 'no-power',
      severity: 'warning',
      title: 'Add a power source',
      description: 'Drop a Battery or DC Source so your circuit comes alive.',
      hint: 'Find batteries under Power in the left palette.'
    });
  }

  const ledWithoutResistor = components.some((component) => component.type === 'led') &&
    !components.some((component) => component.type === 'resistor');

  if (ledWithoutResistor) {
    messages.push({
      id: 'led-no-resistor',
      severity: 'warning',
      title: 'Protect your LED',
      description: 'Add a resistor to limit current. Try 330 Ω for starters.',
      hint: 'Snap the resistor between the battery + and the LED + terminal.'
    });
  }

  const loops = countWireLoops(wires);
  if (loops > 0 && !advancedMode) {
    messages.push({
      id: 'possible-short',
      severity: 'error',
      title: 'Possible short circuit',
      description: 'A loop without resistance could be a short. Check your wiring.',
      hint: 'Look for bright red wires. Hover them to view their voltage and current.'
    });
  }

  if (components.length > 0 && wires.length === 0) {
    messages.push({
      id: 'no-wires',
      severity: 'info',
      title: 'Connect your parts',
      description: 'Drag from one terminal to another to create glowing wires.',
      hint: 'Terminals light up when you hover with a wire.'
    });
  }

  return messages;
}

function countWireLoops(wires: WireConnection[]): number {
  const visited = new Set<string>();
  let loops = 0;

  for (const wire of wires) {
    const key = `${wire.from.componentId}-${wire.to.componentId}`;
    if (visited.has(key)) {
      loops += 1;
    } else {
      visited.add(key);
    }
  }

  return loops;
}
