import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useScadaStore, type DeviceNode } from '../store/scadaStore';
import { Button } from '@lowcode/ui';

const deviceColors: Record<string, { fill: string; stroke: string }> = {
  motor: { fill: '#2563eb', stroke: '#1d4ed8' },
  pump: { fill: '#0891b2', stroke: '#0e7490' },
  conveyor: { fill: '#7c3aed', stroke: '#6d28d9' },
  tank: { fill: '#059669', stroke: '#047857' },
  valve: { fill: '#d97706', stroke: '#b45309' },
  sensor: { fill: '#dc2626', stroke: '#b91c1c' },
};

const statusColors: Record<string, { fill: string; glow: string }> = {
  running: { fill: '#16a34a', glow: '#22c55e' },
  idle: { fill: '#f59e0b', glow: '#fbbf24' },
  warning: { fill: '#f97316', glow: '#fb923c' },
  error: { fill: '#ef4444', glow: '#f87171' },
};

const statusLabels: Record<string, string> = {
  running: '运行中',
  idle: '待机',
  warning: '告警',
  error: '故障',
};

function drawDevice(ctx: CanvasRenderingContext2D, device: DeviceNode, isSelected: boolean) {
  const { x, y, width, height, type, name, status, value, unit, rotation } = device;
  const colors = deviceColors[type] || deviceColors.motor;
  const statusColor = statusColors[status] || statusColors.idle;

  ctx.save();
  const cx = x + width / 2;
  const cy = y + height / 2;

  if (rotation) {
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  ctx.shadowColor = isSelected ? '#2563eb' : statusColor.glow;
  ctx.shadowBlur = isSelected ? 12 : 8;

  ctx.fillStyle = colors.fill;
  ctx.strokeStyle = isSelected ? '#2563eb' : colors.stroke;
  ctx.lineWidth = isSelected ? 3 : 2;

  const radius = 8;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, cx, cy - 8);

  ctx.fillStyle = statusColor.fill;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${value.toFixed(1)}${unit}`, cx, cy + 10);

  ctx.fillStyle = statusColor.fill;
  ctx.font = '10px sans-serif';
  ctx.fillText(statusLabels[status], cx, cy + 26);

  ctx.strokeStyle = statusColor.fill;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, y - 4, 5, 0, Math.PI * 2);
  ctx.fillStyle = statusColor.glow;
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawConnection(ctx: CanvasRenderingContext2D, from: DeviceNode, to: DeviceNode, isActive: boolean) {
  const fx = from.x + from.width / 2;
  const fy = from.y + from.height / 2;
  const tx = to.x + to.width / 2;
  const ty = to.y + to.height / 2;

  ctx.strokeStyle = isActive ? '#16a34a' : '#94a3b8';
  ctx.lineWidth = isActive ? 3 : 2;
  ctx.setLineDash(isActive ? [] : [6, 4]);

  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.setLineDash([]);

  const angle = Math.atan2(ty - fy, tx - fx);
  const arrowSize = 10;
  ctx.fillStyle = isActive ? '#16a34a' : '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(tx - arrowSize * Math.cos(angle - Math.PI / 6), ty - arrowSize * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tx, ty);
  ctx.lineTo(tx - arrowSize * Math.cos(angle + Math.PI / 6), ty - arrowSize * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  if (isActive) {
    const midX = (fx + tx) / 2;
    const midY = (fy + ty) / 2;
    ctx.fillStyle = '#16a34a';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('● 流动中', midX, midY - 10);
  }
}

export const ScadaPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    devices,
    connections,
    selectedDeviceId,
    isRunning,
    selectDevice,
    moveDevice,
    setRunning,
    updateDeviceStatus,
    addDevice,
    addConnection,
    removeDevice,
  } = useScadaStore();

  const [dragging, setDragging] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const initDevices = useCallback(() => {
    if (devices.length > 0) return;

    const defaults: DeviceNode[] = [
      { id: 'd1', type: 'motor', name: 'CNC机床-01', x: 100, y: 80, width: 120, height: 80, status: 'running', value: 85.3, unit: '%', rotation: 0 },
      { id: 'd2', type: 'motor', name: 'CNC机床-02', x: 100, y: 220, width: 120, height: 80, status: 'running', value: 72.1, unit: '%', rotation: 0 },
      { id: 'd3', type: 'pump', name: '冷却泵-01', x: 320, y: 80, width: 110, height: 80, status: 'idle', value: 45.0, unit: 'L/min', rotation: 0 },
      { id: 'd4', type: 'conveyor', name: '传送带-A', x: 320, y: 220, width: 130, height: 80, status: 'running', value: 2.4, unit: 'm/s', rotation: 0 },
      { id: 'd5', type: 'tank', name: '原料罐-01', x: 560, y: 80, width: 120, height: 80, status: 'running', value: 68.5, unit: '%', rotation: 0 },
      { id: 'd6', type: 'valve', name: '调节阀-01', x: 560, y: 220, width: 100, height: 80, status: 'warning', value: 92.0, unit: '%', rotation: 0 },
      { id: 'd7', type: 'sensor', name: '温度传感器-01', x: 100, y: 360, width: 120, height: 80, status: 'running', value: 42.5, unit: '°C', rotation: 0 },
      { id: 'd8', type: 'sensor', name: '压力传感器-01', x: 320, y: 360, width: 120, height: 80, status: 'idle', value: 1.2, unit: 'MPa', rotation: 0 },
      { id: 'd9', type: 'pump', name: '液压泵-01', x: 560, y: 360, width: 110, height: 80, status: 'error', value: 0.0, unit: 'MPa', rotation: 0 },
    ];

    const defaultConnections = [
      { id: 'c1', fromId: 'd1', toId: 'd3', flowRate: 85, status: 'active' as const },
      { id: 'c2', fromId: 'd2', toId: 'd4', flowRate: 72, status: 'active' as const },
      { id: 'c3', fromId: 'd3', toId: 'd5', flowRate: 45, status: 'active' as const },
      { id: 'c4', fromId: 'd4', toId: 'd6', flowRate: 95, status: 'active' as const },
      { id: 'c5', fromId: 'd7', toId: 'd1', flowRate: 0, status: 'inactive' as const },
      { id: 'c6', fromId: 'd8', toId: 'd2', flowRate: 0, status: 'inactive' as const },
    ];

    defaults.forEach((d) => addDevice(d));
    defaultConnections.forEach((c) => addConnection(c));
  }, [devices.length, addDevice, addConnection]);

  useEffect(() => {
    initDevices();
  }, [initDevices]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      devices.forEach((d) => {
        const statuses: DeviceNode['status'][] = ['running', 'running', 'running', 'idle', 'warning', 'error'];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const newValue = Math.max(0, Math.min(100, d.value + (Math.random() - 0.5) * 10));
        updateDeviceStatus(d.id, newStatus, newValue);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isRunning, devices, updateDeviceStatus]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    for (const conn of connections) {
      const from = devices.find((d) => d.id === conn.fromId);
      const to = devices.find((d) => d.id === conn.toId);
      if (from && to) {
        drawConnection(ctx, from, to, conn.status === 'active');
      }
    }

    for (const device of devices) {
      drawDevice(ctx, device, selectedDeviceId === device.id);
    }
  }, [devices, connections, selectedDeviceId]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const findDeviceAt = (x: number, y: number): DeviceNode | undefined => {
    return [...devices].reverse().find((d) => {
      return x >= d.x && x <= d.x + d.width && y >= d.y && y <= d.y + d.height;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    const device = findDeviceAt(x, y);

    if (device) {
      if (e.shiftKey) {
        if (connecting) {
          if (connecting !== device.id) {
            addConnection({
              id: `c-${Date.now()}`,
              fromId: connecting,
              toId: device.id,
              flowRate: 0,
              status: 'active',
            });
          }
          setConnecting(null);
        } else {
          setConnecting(device.id);
        }
      } else {
        selectDevice(device.id);
        setDragging(device.id);
        setDragOffset({ x: x - device.x, y: y - device.y });
      }
    } else {
      selectDevice(null);
      setConnecting(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const { x, y } = getCanvasCoords(e);
    moveDevice(dragging, x - dragOffset.x, y - dragOffset.y);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleDelete = () => {
    if (selectedDeviceId) {
      removeDevice(selectedDeviceId);
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#f0f4f8' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>组态监控面板</span>
            <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>
              Canvas 渲染 · 拖拽移动 · Shift+点击连线
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              type={isRunning ? 'danger' : 'primary'}
              size="small"
              onClick={() => setRunning(!isRunning)}
            >
              {isRunning ? '⏹ 停止' : '▶ 启动模拟'}
            </Button>
            {connecting && (
              <span style={{ fontSize: 12, color: '#0891b2', fontWeight: 600, padding: '4px 8px', backgroundColor: '#ecfeff', borderRadius: 4 }}>
                连线模式: 点击目标设备
              </span>
            )}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 'calc(100% - 44px)', cursor: dragging ? 'grabbing' : connecting ? 'crosshair' : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div style={{ width: 260, borderLeft: '1px solid #e2e8f0', backgroundColor: '#fff', overflowY: 'auto', padding: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          设备详情
        </h3>

        {selectedDevice ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>设备名称</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1d23' }}>{selectedDevice.name}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>设备类型</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{selectedDevice.type}</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>运行状态</div>
              <div style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 10,
                backgroundColor: `${statusColors[selectedDevice.status].fill}20`,
                color: statusColors[selectedDevice.status].fill,
                fontSize: 12,
                fontWeight: 600,
              }}>
                {statusLabels[selectedDevice.status]}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>当前值</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1d23' }}>
                {selectedDevice.value.toFixed(1)}{selectedDevice.unit}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>位置</div>
              <div style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
                ({Math.round(selectedDevice.x)}, {Math.round(selectedDevice.y)})
              </div>
            </div>
            <Button type="danger" size="small" onClick={handleDelete} style={{ width: '100%' }}>
              删除设备
            </Button>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>
            {connecting ? '请点击目标设备完成连线' : '点击设备查看详情\nShift+点击设备开始连线'}
          </div>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>图例</h4>
          {Object.entries(statusColors).map(([key, color]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color.fill }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>{statusLabels[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};