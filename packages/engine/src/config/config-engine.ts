import type { Schema, ComponentSchema } from '@lowcode/core';
import { parseSchema, serializeSchema, updateComponentById, deleteComponentById, findComponentById } from '@lowcode/core';

export interface ConfigEngineState {
  schema: Schema | null;
  selectedComponentId: string | null;
  isDirty: boolean;
  history: Schema[];
  historyIndex: number;
}

export type ConfigEngineAction =
  | { type: 'LOAD_SCHEMA'; payload: string }
  | { type: 'UPDATE_SCHEMA'; payload: Schema }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updater: (comp: ComponentSchema) => ComponentSchema } }
  | { type: 'DELETE_COMPONENT'; payload: string }
  | { type: 'ADD_COMPONENT'; payload: { parentId: string | null; component: ComponentSchema } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MARK_CLEAN' };

export function createInitialConfigState(): ConfigEngineState {
  return {
    schema: null,
    selectedComponentId: null,
    isDirty: false,
    history: [],
    historyIndex: -1,
  };
}

function pushHistory(state: ConfigEngineState): ConfigEngineState {
  if (!state.schema) return state;
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.schema)));
  return {
    ...state,
    history: newHistory.slice(-50),
    historyIndex: Math.min(newHistory.length - 1, 49),
    isDirty: true,
  };
}

export function configEngineReducer(state: ConfigEngineState, action: ConfigEngineAction): ConfigEngineState {
  switch (action.type) {
    case 'LOAD_SCHEMA': {
      const result = parseSchema(action.payload);
      if (!result.success || !result.schema) return state;
      return {
        schema: result.schema,
        selectedComponentId: null,
        isDirty: false,
        history: [JSON.parse(JSON.stringify(result.schema))],
        historyIndex: 0,
      };
    }

    case 'UPDATE_SCHEMA': {
      const newState = pushHistory(state);
      return { ...newState, schema: action.payload };
    }

    case 'SELECT_COMPONENT':
      return { ...state, selectedComponentId: action.payload };

    case 'UPDATE_COMPONENT': {
      if (!state.schema) return state;
      const newState = pushHistory(state);
      const updated = updateComponentById(newState.schema!, action.payload.id, action.payload.updater);
      return { ...newState, schema: updated };
    }

    case 'DELETE_COMPONENT': {
      if (!state.schema) return state;
      const newState = pushHistory(state);
      const updated = deleteComponentById(newState.schema!, action.payload);
      return {
        ...newState,
        schema: updated,
        selectedComponentId: newState.selectedComponentId === action.payload ? null : newState.selectedComponentId,
      };
    }

    case 'ADD_COMPONENT': {
      if (!state.schema) return state;
      const newState = pushHistory(state);
      const updated = { ...newState.schema! };
      if (action.payload.parentId) {
        const addToParent = (components: ComponentSchema[]): ComponentSchema[] =>
          components.map((comp) => {
            if (comp.id === action.payload.parentId) {
              return {
                ...comp,
                children: [...(comp.children || []), action.payload.component],
              };
            }
            if (comp.children) {
              return { ...comp, children: addToParent(comp.children) };
            }
            return comp;
          });
        updated.components = addToParent(updated.components);
      } else {
        updated.components = [...updated.components, action.payload.component];
      }
      return { ...newState, schema: updated };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        schema: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        schema: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
        isDirty: true,
      };
    }

    case 'MARK_CLEAN':
      return { ...state, isDirty: false };

    default:
      return state;
  }
}

export function exportSchema(state: ConfigEngineState): string | null {
  if (!state.schema) return null;
  return serializeSchema(state.schema);
}

export function getSelectedComponent(state: ConfigEngineState): ComponentSchema | null {
  if (!state.schema || !state.selectedComponentId) return null;
  return findComponentById(state.schema, state.selectedComponentId) || null;
}

export function canUndo(state: ConfigEngineState): boolean {
  return state.historyIndex > 0;
}

export function canRedo(state: ConfigEngineState): boolean {
  return state.historyIndex < state.history.length - 1;
}