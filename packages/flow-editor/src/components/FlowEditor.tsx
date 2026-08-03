import React, { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore, type FlowNodeData } from '../store/flowStore';
import { nodeTypes } from './nodes';
import { Button, Input } from '@lowcode/ui';

const defaultNodes: Node<FlowNodeData>[] = [
  {
    id: 'n1',
    type: 'trigger',
    position: { x: 250, y: 0 },
    data: { label: '设备离线告警', nodeType: 'trigger', config: { event: 'device_offline', threshold: 30 } },
  },
  {
    id: 'n2',
    type: 'condition',
    position: { x: 250, y: 130 },
    data: { label: '温度超过阈值?', nodeType: 'condition', config: { field: 'temperature', operator: 'gt', value: 80 } },
  },
  {
    id: 'n3',
    type: 'action',
    position: { x: 100, y: 260 },
    data: { label: '发送通知', nodeType: 'action', config: { action: 'send_notification', channel: 'email' } },
  },
  {
    id: 'n4',
    type: 'action',
    position: { x: 400, y: 260 },
    data: { label: '自动停机', nodeType: 'action', config: { action: 'emergency_stop', delay: 0 } },
  },
];

const defaultEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep', animated: true, style: { stroke: '#2563eb', strokeWidth: 2 } },
  { id: 'e2', source: 'n2', target: 'n3', sourceHandle: 'true', type: 'smoothstep', animated: true, style: { stroke: '#16a34a', strokeWidth: 2 }, label: '是' },
  { id: 'e3', source: 'n2', target: 'n4', sourceHandle: 'false', type: 'smoothstep', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 }, label: '否' },
];

export const FlowEditor: React.FC = () => {
  const {
    nodes,
    edges,
    selectedNodeId,
    validationErrors,
    setNodes,
    setEdges,
    selectNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    removeNode,
    validate,
    updateNode,
  } = useFlowStore();

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  }, [nodes.length, setNodes, setEdges]);

  useEffect(() => {
    validate();
  }, [nodes, edges, validate]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

  const addNode = useCallback(
    (type: 'trigger' | 'condition' | 'action') => {
      const id = `node-${Date.now()}`;
      const labels: Record<string, string> = { trigger: '新触发', condition: '新条件', action: '新动作' };
      const newNode: Node<FlowNodeData> = {
        id,
        type,
        position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
        data: { label: labels[type], nodeType: type, config: {} },
      };
      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes],
  );

  const handleDelete = useCallback(() => {
    if (selectedNodeId) {
      removeNode(selectedNodeId);
    }
  }, [selectedNodeId, removeNode]);

  const handleExport = useCallback(() => {
    const flow = { nodes, edges };
    const json = JSON.stringify(flow, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#f0f4f8' }}>
      <div style={{ width: 220, borderRight: '1px solid #e2e8f0', backgroundColor: '#fff', padding: 12, overflowY: 'auto' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          节点面板
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button type="primary" size="small" onClick={() => addNode('trigger')}>
            ⚡ 添加触发节点
          </Button>
          <Button type="default" size="small" onClick={() => addNode('condition')}>
            ◇ 添加条件节点
          </Button>
          <Button type="default" size="small" onClick={() => addNode('action')}>
            ▶ 添加执行节点
          </Button>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>使用说明</h4>
          <ul style={{ fontSize: 11, color: '#64748b', paddingLeft: 16, lineHeight: 1.8 }}>
            <li>拖拽节点移动位置</li>
            <li>从节点手柄拖出连线</li>
            <li>点击节点查看详情</li>
            <li>条件节点有两个输出</li>
          </ul>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
          <Button type="default" size="small" onClick={handleExport} style={{ width: '100%' }}>
            导出流程 JSON
          </Button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1d23' }}>
            流程编排编辑器
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {validationErrors.length > 0 && (
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                {validationErrors.length} 个问题
              </span>
            )}
            {validationErrors.length === 0 && nodes.length > 0 && (
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ 验证通过</span>
            )}
            <Button type="default" size="small" onClick={validate}>
              验证流程
            </Button>
          </div>
        </div>

        <div style={{ height: 'calc(100% - 44px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => selectNode(node.id)}
            onPaneClick={() => selectNode(null)}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode="Shift"
          >
            <Background color="#e2e8f0" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor="#2563eb"
              nodeColor={(n) => {
                const data = n.data as FlowNodeData | undefined;
                if (!data) return '#e2e8f0';
                const colors: Record<string, string> = { trigger: '#dbeafe', condition: '#fef3c7', action: '#dcfce7' };
                return colors[data.nodeType] || '#e2e8f0';
              }}
              style={{ backgroundColor: '#f8fafc' }}
            />
            <Panel position="top-center">
              {validationErrors.length > 0 && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  maxWidth: 400,
                }}>
                  {validationErrors.map((err, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#991b1b', lineHeight: 1.6 }}>
                      ⚠ {err}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <div style={{ width: 260, borderLeft: '1px solid #e2e8f0', backgroundColor: '#fff', overflowY: 'auto', padding: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          节点详情
        </h3>

        {selectedNode ? (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>节点名称</div>
              <Input
                value={selectedNode.data?.label || ''}
                onChange={(val) =>
                  selectedNode &&
                  updateNode(selectedNode.id, (n) => ({
                    ...n,
                    data: { ...n.data, label: val },
                  }))
                }
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>节点类型</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                {selectedNode.data?.nodeType}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>节点 ID</div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                {selectedNode.id}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>位置</div>
              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
              </div>
            </div>
            <Button type="danger" size="small" onClick={handleDelete} style={{ width: '100%' }}>
              删除节点
            </Button>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>
            点击节点查看详情
          </div>
        )}
      </div>
    </div>
  );
};