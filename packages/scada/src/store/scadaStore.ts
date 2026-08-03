import { create } from 'zustand';

export interface DeviceNode {
  id: string;
  type: 'motor' | 'pump' | 'conveyor' | 'tank' | 'valve' | 'sensor';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'running' | 'idle' | 'warning' | 'error';
  value: number;
  unit: string;
  rotation: number;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  flowRate: number;
  status: 'active' | 'inactive';
}

export interface ScadaState {
  devices: DeviceNode[];
  connections: Connection[];
  selectedDeviceId: string | null;
  isRunning: boolean;
  addDevice: (device: DeviceNode) => void;
  updateDevice: (id: string, updater: (device: DeviceNode) => DeviceNode) => void;
  removeDevice: (id: string) => void;
  selectDevice: (id: string | null) => void;
  moveDevice: (id: string, x: number, y: number) => void;
  addConnection: (connection: Connection) => void;
  removeConnection: (id: string) => void;
  setRunning: (running: boolean) => void;
  updateDeviceStatus: (id: string, status: DeviceNode['status'], value: number) => void;
}

export const useScadaStore = create<ScadaState>((set) => ({
  devices: [],
  connections: [],
  selectedDeviceId: null,
  isRunning: false,

  addDevice: (device) => set((s) => ({ devices: [...s.devices, device] })),
  updateDevice: (id, updater) =>
    set((s) => ({ devices: s.devices.map((d) => (d.id === id ? updater(d) : d)) })),
  removeDevice: (id) =>
    set((s) => ({
      devices: s.devices.filter((d) => d.id !== id),
      connections: s.connections.filter((c) => c.fromId !== id && c.toId !== id),
      selectedDeviceId: s.selectedDeviceId === id ? null : s.selectedDeviceId,
    })),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  moveDevice: (id, x, y) =>
    set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, x, y } : d)) })),
  addConnection: (connection) => set((s) => ({ connections: [...s.connections, connection] })),
  removeConnection: (id) => set((s) => ({ connections: s.connections.filter((c) => c.id !== id) })),
  setRunning: (running) => set({ isRunning: running }),
  updateDeviceStatus: (id, status, value) =>
    set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, status, value } : d)) })),
}));