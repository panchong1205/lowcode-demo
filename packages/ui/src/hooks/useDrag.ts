import { useState, useCallback, useRef, type DragEvent } from 'react';

export interface UseDragOptions {
  data: unknown;
  onDragStart?: (data: unknown) => void;
  onDragEnd?: (data: unknown) => void;
}

export function useDrag<T extends HTMLElement>(options: UseDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dataRef = useRef(options.data);
  dataRef.current = options.data;

  const onDragStart = useCallback(
    (e: DragEvent<T>) => {
      setIsDragging(true);
      e.dataTransfer.setData('application/json', JSON.stringify(dataRef.current));
      e.dataTransfer.effectAllowed = 'copy';
      options.onDragStart?.(dataRef.current);
    },
    [options],
  );

  const onDragEnd = useCallback(
    () => {
      setIsDragging(false);
      options.onDragEnd?.(dataRef.current);
    },
    [options],
  );

  return {
    isDragging,
    dragProps: {
      draggable: true,
      onDragStart,
      onDragEnd,
    },
  };
}

export interface UseDropOptions {
  accept?: string[];
  onDrop?: (data: unknown) => void;
}

export function useDrop<T extends HTMLElement>(options: UseDropOptions = {}) {
  const [isOver, setIsOver] = useState(false);

  const onDragOver = useCallback((e: DragEvent<T>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<T>) => {
      e.preventDefault();
      setIsOver(false);
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        options.onDrop?.(data);
      } catch {
        console.warn('Failed to parse drop data');
      }
    },
    [options],
  );

  return {
    isOver,
    dropProps: {
      onDragOver,
      onDragLeave,
      onDrop,
    },
  };
}