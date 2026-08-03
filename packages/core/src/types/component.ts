export interface ComponentMeta {
  type: string;
  name: string;
  icon: string;
  category: 'basic' | 'form' | 'display' | 'chart' | 'layout';
  defaultProps: Record<string, unknown>;
  defaultStyle: Record<string, unknown>;
  propDefinitions: PropDefinition[];
  allowedChildren?: string[];
  maxChildren?: number;
}

export interface PropDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'json' | 'expression';
  defaultValue?: unknown;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  description?: string;
}

export interface ComponentRegistry {
  register(meta: ComponentMeta): void;
  unregister(type: string): void;
  get(type: string): ComponentMeta | undefined;
  getAll(): ComponentMeta[];
  getByCategory(category: string): ComponentMeta[];
}

export interface DragItem {
  type: string;
  componentMeta: ComponentMeta;
}

export interface DropTarget {
  id: string;
  accepts: string[];
}