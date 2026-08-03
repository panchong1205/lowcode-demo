import type { DSLGraph, DSLNode, DSLEdge } from '@lowcode/core';
import { validateFlowGraph, topologicalSort } from '@lowcode/core';

export interface FlowExecutionResult {
  success: boolean;
  executedNodes: string[];
  errors: string[];
  outputs: Record<string, unknown>;
}

export interface FlowNodeExecutor {
  type: string;
  execute: (node: DSLNode, inputs: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export class FlowEngine {
  private executors = new Map<string, FlowNodeExecutor>();

  registerExecutor(executor: FlowNodeExecutor): void {
    this.executors.set(executor.type, executor);
  }

  async execute(graph: DSLGraph, initialInputs: Record<string, unknown> = {}): Promise<FlowExecutionResult> {
    const validation = validateFlowGraph(graph);
    if (!validation.valid) {
      return {
        success: false,
        executedNodes: [],
        errors: validation.errors.map((e) => e.message),
        outputs: {},
      };
    }

    const sortedIds = topologicalSort(graph);
    const nodeMap = new Map<string, DSLNode>();
    graph.nodes.forEach((n) => nodeMap.set(n.id, n));

    const edgeMap = new Map<string, DSLEdge[]>();
    graph.edges.forEach((e) => {
      const list = edgeMap.get(e.source) || [];
      list.push(e);
      edgeMap.set(e.source, list);
    });

    const executedNodes: string[] = [];
    const outputs: Record<string, unknown> = { ...initialInputs };
    const executionErrors: string[] = [];

    for (const nodeId of sortedIds) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const executor = this.executors.get(node.type);
      if (!executor) {
        executionErrors.push(`No executor for node type: ${node.type}`);
        continue;
      }

      try {
        const nodeInputs = this.collectInputs(nodeId, edgeMap, outputs);
        const nodeOutputs = await executor.execute(node, nodeInputs);
        outputs[nodeId] = nodeOutputs;
        executedNodes.push(nodeId);
      } catch (err) {
        executionErrors.push(`Node "${node.name}" execution failed: ${(err as Error).message}`);
      }
    }

    return {
      success: executionErrors.length === 0,
      executedNodes,
      errors: executionErrors,
      outputs,
    };
  }

  private collectInputs(
    nodeId: string,
    edgeMap: Map<string, DSLEdge[]>,
    outputs: Record<string, unknown>,
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    for (const [, edges] of edgeMap) {
      for (const edge of edges) {
        if (edge.target === nodeId) {
          const sourceOutput = outputs[edge.source];
          if (sourceOutput) {
            Object.assign(inputs, sourceOutput);
          }
        }
      }
    }
    return inputs;
  }
}

export const defaultFlowEngine = new FlowEngine();

export function registerDefaultExecutors(engine: FlowEngine): void {
  engine.registerExecutor({
    type: 'trigger',
    execute: async (node, inputs) => {
      return { triggered: true, timestamp: Date.now(), ...node.config, ...inputs };
    },
  });

  engine.registerExecutor({
    type: 'condition',
    execute: async (node, inputs) => {
      const field = node.config.field as string;
      const operator = node.config.operator as string;
      const value = node.config.value;
      const fieldValue = inputs[field];
      let result = false;
      switch (operator) {
        case 'eq': result = fieldValue === value; break;
        case 'gt': result = (fieldValue as number) > (value as number); break;
        case 'gte': result = (fieldValue as number) >= (value as number); break;
        case 'lt': result = (fieldValue as number) < (value as number); break;
        case 'lte': result = (fieldValue as number) <= (value as number); break;
        case 'contains': result = String(fieldValue).includes(String(value)); break;
      }
      return { result, field: fieldValue };
    },
  });

  engine.registerExecutor({
    type: 'action',
    execute: async (node, inputs) => {
      return { action: node.config.action, status: 'completed', ...inputs };
    },
  });
}