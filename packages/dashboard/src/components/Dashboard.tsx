import React, { useState, useEffect, useCallback } from 'react';
import { ChartContainer } from './ChartContainer';
import { generateTimeSeriesData, generateGaugeValue, generateCategoryData, formatTime, formatNumber, generateDeviceStatus } from '../hooks/useRealtimeData';
import { Card, Button, Select } from '@lowcode/ui';
import type { EChartsOption } from 'echarts';

export const Dashboard: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLineOption = useCallback((): EChartsOption => {
    const data = generateTimeSeriesData(60, 75, 20, 60000);
    return {
      title: { text: '设备运行效率趋势', left: 'center', textStyle: { fontSize: 14, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' } },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map((d) => formatTime(d.time)),
        axisLabel: { rotate: 45, fontSize: 10, color: theme === 'dark' ? '#94a3b8' : '#64748b' },
      },
      yAxis: {
        type: 'value',
        name: '效率 (%)',
        axisLabel: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
      },
      grid: { left: 50, right: 20, top: 50, bottom: 40 },
      series: [
        {
          name: 'CNC机床',
          data: data.map((d) => d.value),
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: '#2563eb', width: 2 },
          itemStyle: { color: '#2563eb' },
        },
        {
          name: '机器人',
          data: data.map((d) => d.value * 0.8 + Math.random() * 10),
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.15 },
          lineStyle: { color: '#0891b2', width: 2 },
          itemStyle: { color: '#0891b2' },
        },
      ],
      legend: {
        bottom: 0,
        textStyle: { color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' },
      },
    };
  }, [theme, tick]);

  const getBarOption = useCallback((): EChartsOption => {
    const data = generateCategoryData(['产线A', '产线B', '产线C', '产线D', '产线E'], 85, 20);
    return {
      title: { text: '各产线产量统计', left: 'center', textStyle: { fontSize: 14, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' } },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
      },
      yAxis: {
        type: 'value',
        name: '产量 (件)',
        axisLabel: { color: theme === 'dark' ? '#94a3b8' : '#64748b' },
      },
      grid: { left: 50, right: 20, top: 50, bottom: 30 },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#2563eb' },
                { offset: 1, color: '#0891b2' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '50%',
        },
      ],
    };
  }, [theme, tick]);

  const getPieOption = useCallback((): EChartsOption => {
    const data = generateCategoryData(['正常运行', '待机', '告警', '故障'], 60, 30);
    return {
      title: { text: '设备状态分布', left: 'center', textStyle: { fontSize: 14, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' } },
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: 0,
        textStyle: { color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: data.map((d) => ({ ...d, name: d.name })),
          itemStyle: {
            borderRadius: 4,
            borderColor: theme === 'dark' ? '#1e293b' : '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' },
          },
        },
      ],
      color: ['#16a34a', '#f59e0b', '#f97316', '#ef4444'],
    };
  }, [theme, tick]);

  const getGaugeOption = useCallback((): EChartsOption => {
    const value = generateGaugeValue(0, 100);
    return {
      title: { text: '综合效率 OEE', left: 'center', textStyle: { fontSize: 14, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' } },
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          center: ['50%', '60%'],
          radius: '85%',
          min: 0,
          max: 100,
          splitNumber: 10,
          axisLine: {
            show: true,
            lineStyle: {
              width: 20,
              color: [
                [0.3, '#ef4444'],
                [0.6, '#f59e0b'],
                [0.8, '#2563eb'],
                [1, '#16a34a'],
              ],
            },
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '70%',
            width: 8,
            itemStyle: { color: 'auto' },
          },
          axisTick: { distance: -20, length: 6, lineStyle: { width: 1, color: '#999' } },
          splitLine: { distance: -24, length: 16, lineStyle: { width: 2, color: '#999' } },
          axisLabel: { color: '#464646', fontSize: 10, distance: 30 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: theme === 'dark' ? '#e2e8f0' : '#1a1d23',
            fontSize: 24,
            fontWeight: 'bold',
            offsetCenter: [0, '70%'],
          },
          data: [{ value }],
        },
      ],
    };
  }, [theme, tick]);

  const deviceStatus = generateDeviceStatus();

  const statusColors: Record<string, string> = {
    running: '#16a34a',
    idle: '#f59e0b',
    warning: '#f97316',
    error: '#ef4444',
  };

  const statusLabels: Record<string, string> = {
    running: '运行中',
    idle: '待机',
    warning: '告警',
    error: '故障',
  };

  return (
    <div style={{ padding: 20, backgroundColor: theme === 'dark' ? '#0f172a' : '#f0f4f8', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' }}>
            工业数据可视化大屏
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
            ECharts 多图表联动 · 实时数据模拟 · 主题切换
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Select
            options={[
              { label: '最近1小时', value: '1h' },
              { label: '最近6小时', value: '6h' },
              { label: '最近24小时', value: '24h' },
            ]}
            value={timeRange}
            onChange={(v) => setTimeRange(String(v))}
            style={{ width: 140 }}
          />
          <Button
            type={autoRefresh ? 'primary' : 'default'}
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸ 自动刷新' : '▶ 手动刷新'}
          </Button>
          <Button
            type="default"
            size="small"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '🌙 暗色' : '☀️ 亮色'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        {Object.entries(deviceStatus).slice(0, 6).map(([name, info]) => (
          <Card key={name} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{name}</div>
            <div style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 10,
              backgroundColor: `${statusColors[info.status]}20`,
              color: statusColors[info.status],
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
            }}>
              {statusLabels[info.status]}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: theme === 'dark' ? '#e2e8f0' : '#1a1d23' }}>
              {formatNumber(info.value, 0)}%
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Card title="设备运行效率趋势">
          <div style={{ height: 300 }}>
            <ChartContainer option={getLineOption()} theme={theme} />
          </div>
        </Card>
        <Card title="各产线产量统计">
          <div style={{ height: 300 }}>
            <ChartContainer option={getBarOption()} theme={theme} />
          </div>
        </Card>
        <Card title="设备状态分布">
          <div style={{ height: 300 }}>
            <ChartContainer option={getPieOption()} theme={theme} />
          </div>
        </Card>
        <Card title="综合效率 OEE">
          <div style={{ height: 300 }}>
            <ChartContainer option={getGaugeOption()} theme={theme} />
          </div>
        </Card>
      </div>
    </div>
  );
};