export type ComponentType =
  | 'container'
  | 'text'
  | 'input'
  | 'select'
  | 'button'
  | 'table'
  | 'chart'
  | 'gauge'
  | 'image'
  | 'tabs'
  | 'card'
  | 'grid';

export interface StyleProps {
  width?: number | string;
  height?: number | string;
  margin?: number | string;
  padding?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  fontSize?: number;
  color?: string;
  display?: 'block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: number;
  [key: string]: unknown;
}

export interface DataBinding {
  source: string;
  path: string;
  transform?: string;
  refreshInterval?: number;
}

export interface EventHandler {
  event: string;
  action: string;
  params?: Record<string, unknown>;
}

export interface ComponentSchema {
  id: string;
  type: ComponentType;
  label?: string;
  props: Record<string, unknown>;
  style?: StyleProps;
  children?: ComponentSchema[];
  dataBinding?: DataBinding;
  events?: EventHandler[];
  visible?: boolean;
  disabled?: boolean;
  conditions?: ConditionRule[];
}

export interface ConditionRule {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: unknown;
  action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface PageSchema {
  id: string;
  name: string;
  version: string;
  layout: 'grid' | 'flex' | 'absolute';
  theme?: string;
  components: ComponentSchema[];
  dataSources?: DataSource[];
  variables?: Record<string, unknown>;
}

export interface DataSource {
  id: string;
  type: 'api' | 'websocket' | 'static' | 'mock';
  config: Record<string, unknown>;
}

export type Schema = PageSchema;