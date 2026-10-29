import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, type Node, type Edge, type Connection, type NodeChange, type EdgeChange } from 'reactflow';

export interface FlowNodeData {
  label: string;
  nodeType: 'trigger' | 'condition' | 'action';
  config: Record<string, unknown>;
}

export interface FlowStore {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  validationErrors: string[];
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<FlowNodeData>) => void;
  updateNode: (id: string, updater: (node: Node<FlowNodeData>) => Node<FlowNodeData>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setValidationErrors: (errors: string[]) => void;
  validate: () => void;
}

let nodeIdCounter = 0;

export const useFlowStore = create<FlowStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  validationErrors: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),

  updateNode: (id, updater) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? updater(n) : n)),
    })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge] })),

  removeEdge: (id) => set((s) => ({ edges: s.edges.filter((e) => e.id !== id) })),

  selectNode: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) =>
    set((s) => ({
      nodes: applyNodeChanges(s.nodes, changes),
    })),

  onEdgesChange: (changes) =>
    set((s) => ({
      edges: applyEdgeChanges(s.edges, changes),
    })),

  onConnect: (connection) => {
    nodeIdCounter++;
    set((s) => ({
      edges: [
        ...s.edges,
        {
          id: `e-${nodeIdCounter}`,
          source: connection.source || '',
          target: connection.target || '',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#2563eb', strokeWidth: 2 },
        },
      ],
    }));
  },

  setValidationErrors: (errors) => set({ validationErrors: errors }),

  validate: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];

    if (nodes.length === 0) {
      errors.push('流程图中没有节点');
    } else {
      const hasTrigger = nodes.some((n) => n.data?.nodeType === 'trigger');
      const hasAction = nodes.some((n) => n.data?.nodeType === 'action');

      if (!hasTrigger) errors.push('缺少触发节点');
      if (!hasAction) errors.push('缺少执行节点');

      const nodeIds = new Set(nodes.map((n) => n.id));
      const connectedNodes = new Set<string>();
      for (const edge of edges) {
        if (!nodeIds.has(edge.source)) {
          errors.push(`连线引用了不存在的源节点`);
        }
        if (!nodeIds.has(edge.target)) {
          errors.push(`连线引用了不存在的目标节点`);
        }
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }

      for (const node of nodes) {
        if (!connectedNodes.has(node.id) && nodes.length > 1) {
          errors.push(`节点 "${node.data?.label || node.id}" 未连接`);
        }
      }
    }

    set({ validationErrors: errors });
  },
}));

function applyNodeChanges(nodes: Node[], changes: NodeChange[]): Node[] {
  const updated = [...nodes];
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      const idx = updated.findIndex((n) => n.id === change.id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], position: change.position };
      }
    }
    if (change.type === 'remove') {
      const idx = updated.findIndex((n) => n.id === change.id);
      if (idx >= 0) {
        updated.splice(idx, 1);
      }
    }
  }
  return updated;
}

function applyEdgeChanges(edges: Edge[], changes: EdgeChange[]): Edge[] {
  const updated = [...edges];
  for (const change of changes) {
    if (change.type === 'remove') {
      const idx = updated.findIndex((e) => e.id === change.id);
      if (idx >= 0) {
        updated.splice(idx, 1);
      }
    }
  }
  return updated;
}