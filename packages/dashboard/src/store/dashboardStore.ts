import { create } from 'zustand';
import type { EChartsOption } from 'echarts';

export interface DashboardChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'gauge';
  option: EChartsOption;
  dataSource: string;
  refreshInterval: number;
}

export interface DashboardState {
  charts: DashboardChart[];
  theme: 'light' | 'dark';
  timeRange: [number, number];
  refreshAll: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setTimeRange: (range: [number, number]) => void;
  toggleRefreshAll: () => void;
  addChart: (chart: DashboardChart) => void;
  updateChart: (id: string, updater: (chart: DashboardChart) => DashboardChart) => void;
  removeChart: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  charts: [],
  theme: 'light',
  timeRange: [Date.now() - 3600000, Date.now()],
  refreshAll: true,
  setTheme: (theme) => set({ theme }),
  setTimeRange: (timeRange) => set({ timeRange }),
  toggleRefreshAll: () => set((s) => ({ refreshAll: !s.refreshAll })),
  addChart: (chart) => set((s) => ({ charts: [...s.charts, chart] })),
  updateChart: (id, updater) =>
    set((s) => ({
      charts: s.charts.map((c) => (c.id === id ? updater(c) : c)),
    })),
  removeChart: (id) => set((s) => ({ charts: s.charts.filter((c) => c.id !== id) })),
}));