import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { FlowNodeData } from '../store/flowStore';

const nodeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  trigger: { bg: '#dbeafe', border: '#2563eb', icon: '⚡' },
  condition: { bg: '#fef3c7', border: '#f59e0b', icon: '◇' },
  action: { bg: '#dcfce7', border: '#16a34a', icon: '▶' },
};

const TriggerNode: React.FC<NodeProps<FlowNodeData>> = ({ data, selected }) => {
  const style = nodeStyles[data.nodeType] || nodeStyles.trigger;
  return (
    <div
      style={{
        padding: '10px 16px',
        backgroundColor: style.bg,
        border: `2px solid ${selected ? '#2563eb' : style.border}`,
        borderRadius: 8,
        minWidth: 140,
        textAlign: 'center',
        boxShadow: selected ? '0 0 0 2px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: 13,
      }}
    >
      <Handle type="source" position={Position.Bottom} style={{ background: style.border }} />
      <div style={{ fontSize: 16, marginBottom: 4 }}>{style.icon}</div>
      <div style={{ fontWeight: 700, color: '#1a1d23' }}>{data.label}</div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{data.nodeType}</div>
      <Handle type="target" position={Position.Top} style={{ background: style.border }} />
    </div>
  );
};

const ConditionNode: React.FC<NodeProps<FlowNodeData>> = ({ data, selected }) => {
  const style = nodeStyles[data.nodeType] || nodeStyles.condition;
  return (
    <div
      style={{
        padding: '10px 16px',
        backgroundColor: style.bg,
        border: `2px solid ${selected ? '#2563eb' : style.border}`,
        borderRadius: 8,
        minWidth: 140,
        textAlign: 'center',
        boxShadow: selected ? '0 0 0 2px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: 13,
        transform: 'rotate(0deg)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border }} />
      <div style={{ fontSize: 16, marginBottom: 4 }}>{style.icon}</div>
      <div style={{ fontWeight: 700, color: '#1a1d23' }}>{data.label}</div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{data.nodeType}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#16a34a' }} id="true" />
      <Handle type="source" position={Position.Right} style={{ background: '#ef4444' }} id="false" />
    </div>
  );
};

const ActionNode: React.FC<NodeProps<FlowNodeData>> = ({ data, selected }) => {
  const style = nodeStyles[data.nodeType] || nodeStyles.action;
  return (
    <div
      style={{
        padding: '10px 16px',
        backgroundColor: style.bg,
        border: `2px solid ${selected ? '#2563eb' : style.border}`,
        borderRadius: 8,
        minWidth: 140,
        textAlign: 'center',
        boxShadow: selected ? '0 0 0 2px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        fontSize: 13,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border }} />
      <div style={{ fontSize: 16, marginBottom: 4 }}>{style.icon}</div>
      <div style={{ fontWeight: 700, color: '#1a1d23' }}>{data.label}</div>
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{data.nodeType}</div>
      <Handle type="source" position={Position.Bottom} style={{ background: style.border }} />
    </div>
  );
};

export const nodeTypes = {
  trigger: memo(TriggerNode),
  condition: memo(ConditionNode),
  action: memo(ActionNode),
};