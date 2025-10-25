import { useEffect } from 'react';

type Handler = (event: KeyboardEvent) => void;

type HotkeyMap = Record<string, Handler>;

export const useHotkeys = (handlers: HotkeyMap) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.code;
      const handler = handlers[key];
      if (handler) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers]);
};
