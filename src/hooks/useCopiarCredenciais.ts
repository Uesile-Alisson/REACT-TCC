import { useCallback, useState } from 'react';

export type ClipboardState = 'idle' | 'copied' | 'manual';

export function useCopiarCredenciais(): {
  clipboardState: ClipboardState;
  copyCredentials: (content: string) => Promise<void>;
  resetClipboardState: () => void;
} {
  const [clipboardState, setClipboardState] = useState<ClipboardState>('idle');

  const copyCredentials = useCallback(async (content: string): Promise<void> => {
    if (!navigator.clipboard?.writeText) {
      setClipboardState('manual');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setClipboardState('copied');
    } catch {
      setClipboardState('manual');
    }
  }, []);

  const resetClipboardState = useCallback((): void => {
    setClipboardState('idle');
  }, []);

  return {
    clipboardState,
    copyCredentials,
    resetClipboardState,
  };
}
