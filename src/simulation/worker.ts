/// <reference lib="webworker" />
import { nanoid } from 'nanoid';
import type { SimulationSnapshot } from '@shared/types';

let lastSnapshot: SimulationSnapshot = {
  timestamp: Date.now(),
  nodeVoltages: {},
  nodeCurrents: {},
  faults: []
};

const connections = new Map<string, { from: string; to: string }>();

const send = (data: unknown) => {
  postMessage(data);
};

const compute = () => {
  const blink = (Math.sin(Date.now() / 250) + 1) / 2;
  lastSnapshot = {
    timestamp: Date.now(),
    nodeVoltages: {
      probe: 3 + blink * 2,
      ch1: blink * 5,
      ch2: 2.5 - blink * 2.5
    },
    nodeCurrents: {
      probe: 0.02 + blink * 0.01
    },
    faults: connections.size > 6 ? ['Too many parallel wires'] : []
  };
  send({ type: 'simulation-update', data: lastSnapshot });
};

setInterval(compute, 250);

onmessage = (event) => {
  const { data } = event;
  if (data.type === 'init') {
    send({ type: 'ready' });
    send({
      type: 'coach-message',
      data: {
        id: nanoid(),
        level: 'info',
        text: 'Drag a battery, resistor, and LED onto the canvas to start the blinker tutorial.'
      }
    });
  }
  if (data.type === 'connect') {
    connections.set(data.payload.id, { from: data.payload.from, to: data.payload.to });
  }
  if (data.type === 'disconnect') {
    connections.delete(data.payload.id);
  }
  if (data.type === 'add-component') {
    send({
      type: 'coach-message',
      data: {
        id: nanoid(),
        level: 'success',
        text: `Added ${data.payload.component.name}. Wire it up to continue!`
      }
    });
  }
};
