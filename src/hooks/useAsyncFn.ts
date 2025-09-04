import { useState, useCallback } from "react";

export function useAsyncFn<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  onComplete?: (data?: T) => void,
  onPrepare?: () => void
) {
  const [loading, setLoading] = useState(false);
  const execute = useCallback(
    async (...args: Args) => {
      onPrepare?.();
      setLoading(true);
      try {
        const result = await fn(...args);
        onComplete?.(result);
        return result;
      } catch (err) {
        console.error;
        onComplete?.(undefined);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn, onComplete]
  );
  return { execute, loading };
}
