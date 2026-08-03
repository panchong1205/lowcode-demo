export interface TimeSeriesPoint {
  time: number;
  value: number;
}

export function generateTimeSeriesData(
  count: number,
  baseValue: number,
  variance: number,
  intervalMs: number = 60000,
  endTime: number = Date.now(),
): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    data.push({
      time: endTime - i * intervalMs,
      value: baseValue + (Math.random() - 0.5) * variance,
    });
  }
  return data;
}

export function generateGaugeValue(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function generateCategoryData(
  categories: string[],
  baseValue: number,
  variance: number,
): { name: string; value: number }[] {
  return categories.map((name) => ({
    name,
    value: baseValue + (Math.random() - 0.5) * variance,
  }));
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatNumber(value: number, decimals: number = 1): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(decimals) + '万';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(decimals) + 'k';
  }
  return value.toFixed(decimals);
}

export function generateDeviceStatus(): Record<string, { status: string; value: number }> {
  const devices = ['CNC机床-01', '机器人-02', '传送带-03', '注塑机-04', '焊接机-05', '包装机-06'];
  const statuses = ['running', 'idle', 'warning', 'error'];
  const statusWeights = [0.6, 0.25, 0.1, 0.05];

  const result: Record<string, { status: string; value: number }> = {};
  for (const device of devices) {
    const rand = Math.random();
    let statusIndex = 0;
    let cumulative = 0;
    for (let i = 0; i < statuses.length; i++) {
      cumulative += statusWeights[i];
      if (rand <= cumulative) {
        statusIndex = i;
        break;
      }
    }
    result[device] = {
      status: statuses[statusIndex],
      value: 30 + Math.random() * 70,
    };
  }
  return result;
}