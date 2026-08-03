import { useState, useCallback, useEffect, useRef, type MouseEvent } from 'react';

export interface UseResizeOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (size: { width: number; height: number }) => void;
}

export function useResize(options: UseResizeOptions = {}) {
  const { minWidth = 50, minHeight = 50, maxWidth = Infinity, maxHeight = Infinity, onResize } = options;
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [isResizing, setIsResizing] = useState(false);
  const startRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startRef.current = { x: e.clientX, y: e.clientY, width: size.width, height: size.height };
    },
    [size],
  );

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: globalThis.MouseEvent) => {
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startRef.current.width + dx));
      const newHeight = Math.min(maxHeight, Math.max(minHeight, startRef.current.height + dy));
      setSize({ width: newWidth, height: newHeight });
      onResize?.({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, minWidth, minHeight, maxWidth, maxHeight, onResize]);

  return { size, setSize, isResizing, onMouseDown };
}