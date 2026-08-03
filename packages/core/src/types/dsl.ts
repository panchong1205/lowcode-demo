export type DSLNodeType = 'trigger' | 'condition' | 'action' | 'loop' | 'parallel' | 'subflow';

export interface DSLNode {
  id: string;
  type: DSLNodeType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface DSLEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface DSLGraph {
  id: string;
  name: string;
  version: string;
  nodes: DSLNode[];
  edges: DSLEdge[];
  variables?: Record<string, unknown>;
}

export interface DSLValidationResult {
  valid: boolean;
  errors: DSLValidationError[];
  warnings: DSLValidationWarning[];
}

export interface DSLValidationError {
  type: 'cycle' | 'disconnected' | 'missing_start' | 'missing_end' | 'invalid_config';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface DSLValidationWarning {
  type: 'unreachable' | 'redundant' | 'deprecated';
  message: string;
  nodeId?: string;
}