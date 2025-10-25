import { useCallback, useState } from 'react';
import { useCanvas } from '../state/canvasStore';

export type ShareStatus = 'idle' | 'uploading' | 'queued' | 'error' | 'complete';

const API_ENDPOINT = 'https://example.com/api/share';

export const useShareLink = () => {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [lastLink, setLastLink] = useState<string | undefined>();
  const [queue, setQueue] = useState<string[]>([]);

  const upload = useCallback(async () => {
    const payload = JSON.stringify({
      components: useCanvas.getState().components,
      wires: useCanvas.getState().wires,
    });
    try {
      setStatus('uploading');
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      setLastLink(data.url);
      setStatus('complete');
    } catch (error) {
      console.error(error);
      setQueue((prev) => [...prev, payload]);
      setStatus('queued');
    }
  }, []);

  const flushQueue = useCallback(async () => {
    if (queue.length === 0) return;
    const [next, ...rest] = queue;
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: next,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      setLastLink(data.url);
      setQueue(rest);
      setStatus('complete');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, [queue]);

  return { status, lastLink, upload, flushQueue };
};
