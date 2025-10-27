import React from 'react';
import { useAppStore } from '../state/appStore';

export const InstrumentationStrip: React.FC = () => {
  const simulation = useAppStore((state) => state.simulation);

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '0.75rem 1rem',
        background: '#121620',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}
    >
      <div>
        <strong>Multimeter</strong>
        <div>Voltage: {simulation?.nodeVoltages['probe']?.toFixed(2) ?? '0.00'} V</div>
        <div>Current: {simulation?.nodeCurrents['probe']?.toFixed(2) ?? '0.00'} A</div>
      </div>
      <div>
        <strong>Oscilloscope</strong>
        <div>Channel 1: {simulation?.nodeVoltages['ch1']?.toFixed(2) ?? '0.00'} V</div>
        <div>Channel 2: {simulation?.nodeVoltages['ch2']?.toFixed(2) ?? '0.00'} V</div>
      </div>
      <div>
        <strong>Faults</strong>
        <div>{simulation?.faults.join(', ') || 'All clear'}</div>
      </div>
    </footer>
  );
};
