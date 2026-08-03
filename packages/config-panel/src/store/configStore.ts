import { create } from 'zustand';
import type { ComponentSchema, PageSchema } from '@lowcode/core';
import { configEngineReducer, createInitialConfigState, getSelectedComponent, canUndo, canRedo, exportSchema, type ConfigEngineState, type ConfigEngineAction } from '@lowcode/engine';

interface ConfigStore extends ConfigEngineState {
  dispatch: (action: ConfigEngineAction) => void;
  loadSchema: (json: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updater: (comp: ComponentSchema) => ComponentSchema) => void;
  deleteComponent: (id: string) => void;
  addComponent: (parentId: string | null, component: ComponentSchema) => void;
  undo: () => void;
  redo: () => void;
  getSelectedComponent: () => ComponentSchema | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  exportSchema: () => string | null;
  createEmptySchema: () => void;
}

export const useConfigStore = create<ConfigStore>((set, get) => {
  const initialState = createInitialConfigState();

  return {
    ...initialState,

    dispatch: (action: ConfigEngineAction) => {
      set((state) => configEngineReducer(state, action));
    },

    loadSchema: (json: string) => {
      set((state) => configEngineReducer(state, { type: 'LOAD_SCHEMA', payload: json }));
    },

    selectComponent: (id: string | null) => {
      set((state) => configEngineReducer(state, { type: 'SELECT_COMPONENT', payload: id }));
    },

    updateComponent: (id: string, updater: (comp: ComponentSchema) => ComponentSchema) => {
      set((state) => configEngineReducer(state, { type: 'UPDATE_COMPONENT', payload: { id, updater } }));
    },

    deleteComponent: (id: string) => {
      set((state) => configEngineReducer(state, { type: 'DELETE_COMPONENT', payload: id }));
    },

    addComponent: (parentId: string | null, component: ComponentSchema) => {
      set((state) => configEngineReducer(state, { type: 'ADD_COMPONENT', payload: { parentId, component } }));
    },

    undo: () => {
      set((state) => configEngineReducer(state, { type: 'UNDO' }));
    },

    redo: () => {
      set((state) => configEngineReducer(state, { type: 'REDO' }));
    },

    getSelectedComponent: () => getSelectedComponent(get()),

    canUndo: () => canUndo(get()),

    canRedo: () => canRedo(get()),

    exportSchema: () => exportSchema(get()),

    createEmptySchema: () => {
      const emptySchema: PageSchema = {
        id: `page-${Date.now()}`,
        name: '新页面',
        version: '1.0.0',
        layout: 'flex',
        components: [],
      };
      set((state) => configEngineReducer(state, { type: 'UPDATE_SCHEMA', payload: emptySchema }));
    },
  };
});