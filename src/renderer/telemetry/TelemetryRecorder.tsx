import React, { useEffect, useRef } from 'react';

interface TelemetryEvent {
  event: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export const TelemetryRecorder: React.FC = () => {
  const bufferRef = useRef<TelemetryEvent[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as TelemetryEvent;
      bufferRef.current = [...bufferRef.current.slice(-99), detail];
      localStorage.setItem('nodelab-telemetry-buffer', JSON.stringify(bufferRef.current));
    };
    window.addEventListener('nodelab-telemetry', handler as EventListener);
    return () => window.removeEventListener('nodelab-telemetry', handler as EventListener);
  }, []);

  return null;
};
