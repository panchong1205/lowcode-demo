import type { DSLGraph, DSLValidationResult, DSLValidationError, DSLValidationWarning } from '../types/dsl';

export function parseDSL(json: string): { success: boolean; graph?: DSLGraph; errors: string[] } {
  try {
    const graph = JSON.parse(json) as DSLGraph;
    const errors = validateDSL(graph);
    return { success: errors.length === 0, graph, errors };
  } catch {
    return { success: false, errors: ['Invalid DSL JSON format'] };
  }
}

export function validateDSL(graph: DSLGraph): string[] {
  const errors: string[] = [];

  if (!graph.id) errors.push('Graph id is required');
  if (!graph.name) errors.push('Graph name is required');
  if (!graph.nodes || graph.nodes.length === 0) {
    errors.push('Graph must have at least one node');
  }

  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references unknown source node "${edge.source}"`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references unknown target node "${edge.target}"`);
    }
  }

  return errors;
}

export function validateFlowGraph(graph: DSLGraph): DSLValidationResult {
  const errors: DSLValidationError[] = [];
  const warnings: DSLValidationWarning[] = [];

  if (graph.nodes.length === 0) {
    errors.push({
      type: 'missing_start',
      message: 'Flow graph must have at least one node',
    });
    return { valid: false, errors, warnings };
  }

  const hasTrigger = graph.nodes.some((n) => n.type === 'trigger');
  if (!hasTrigger) {
    warnings.push({
      type: 'missing_start',
      message: 'Flow graph has no trigger node',
    });
  }

  const hasAction = graph.nodes.some((n) => n.type === 'action');
  if (!hasAction) {
    warnings.push({
      type: 'missing_end',
      message: 'Flow graph has no action node',
    });
  }

  const cycles = detectCycles(graph);
  if (cycles.length > 0) {
    for (const cycle of cycles) {
      errors.push({
        type: 'cycle',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        nodeId: cycle[0],
      });
    }
  }

  const referencedNodes = new Set<string>();
  for (const edge of graph.edges) {
    referencedNodes.add(edge.source);
    referencedNodes.add(edge.target);
  }

  for (const node of graph.nodes) {
    if (!referencedNodes.has(node.id) && graph.nodes.length > 1) {
      warnings.push({
        type: 'disconnected',
        message: `Node "${node.name}" is not connected to any edge`,
        nodeId: node.id,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function detectCycles(graph: DSLGraph): string[][] {
  const adjacency = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of graph.edges) {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (stack.has(nodeId)) {
      const cycleStart = path.indexOf(nodeId);
      if (cycleStart >= 0) {
        cycles.push([...path.slice(cycleStart), nodeId]);
      }
      return;
    }
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    stack.add(nodeId);
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor, [...path, nodeId]);
    }
    stack.delete(nodeId);
  }

  for (const nodeId of adjacency.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }

  return cycles;
}

export function topologicalSort(graph: DSLGraph): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of graph.nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of graph.edges) {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  const result: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}