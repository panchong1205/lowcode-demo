import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ChartContainerProps {
  option: EChartsOption;
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
  onChartReady?: (chart: echarts.ECharts) => void;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  option,
  theme = 'light',
  style = {},
  onChartReady,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, theme);
      onChartReady?.(chartInstance.current);
    }

    chartInstance.current.setOption(option, true);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [option, theme, onChartReady]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 200,
        ...style,
      }}
    />
  );
};