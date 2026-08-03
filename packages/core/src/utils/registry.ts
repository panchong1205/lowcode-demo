import type { ComponentMeta, ComponentRegistry } from '../types/component';

export function createComponentRegistry(): ComponentRegistry {
  const registry = new Map<string, ComponentMeta>();

  return {
    register(meta: ComponentMeta): void {
      if (registry.has(meta.type)) {
        console.warn(`Component type "${meta.type}" is already registered, overwriting.`);
      }
      registry.set(meta.type, { ...meta });
    },
    unregister(type: string): void {
      registry.delete(type);
    },
    get(type: string): ComponentMeta | undefined {
      return registry.get(type);
    },
    getAll(): ComponentMeta[] {
      return Array.from(registry.values());
    },
    getByCategory(category: string): ComponentMeta[] {
      return Array.from(registry.values()).filter((meta) => meta.category === category);
    },
  };
}

export const defaultComponentRegistry = createComponentRegistry();

export function registerBuiltinComponents(registry: ComponentRegistry): void {
  const builtins: ComponentMeta[] = [
    {
      type: 'container',
      name: '容器',
      icon: 'container',
      category: 'layout',
      defaultProps: {},
      defaultStyle: { padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
      propDefinitions: [],
      allowedChildren: ['text', 'input', 'select', 'button', 'table', 'chart', 'card', 'image', 'tabs', 'grid', 'container'],
    },
    {
      type: 'text',
      name: '文本',
      icon: 'text',
      category: 'display',
      defaultProps: { content: '文本内容' },
      defaultStyle: { fontSize: 14, color: '#333333' },
      propDefinitions: [
        { name: 'content', label: '文本内容', type: 'string', defaultValue: '文本内容' },
        { name: 'align', label: '对齐方式', type: 'select', options: [{ label: '左', value: 'left' }, { label: '中', value: 'center' }, { label: '右', value: 'right' }] },
      ],
    },
    {
      type: 'input',
      name: '输入框',
      icon: 'input',
      category: 'form',
      defaultProps: { placeholder: '请输入', value: '' },
      defaultStyle: { width: '100%', height: 32 },
      propDefinitions: [
        { name: 'placeholder', label: '占位符', type: 'string', defaultValue: '请输入' },
        { name: 'value', label: '默认值', type: 'string' },
        { name: 'type', label: '类型', type: 'select', options: [{ label: '文本', value: 'text' }, { label: '数字', value: 'number' }, { label: '密码', value: 'password' }] },
      ],
    },
    {
      type: 'select',
      name: '下拉框',
      icon: 'select',
      category: 'form',
      defaultProps: { options: [], value: '' },
      defaultStyle: { width: '100%', height: 32 },
      propDefinitions: [
        { name: 'options', label: '选项', type: 'json', defaultValue: [] },
        { name: 'value', label: '默认值', type: 'string' },
      ],
    },
    {
      type: 'button',
      name: '按钮',
      icon: 'button',
      category: 'basic',
      defaultProps: { text: '按钮', type: 'primary' },
      defaultStyle: {},
      propDefinitions: [
        { name: 'text', label: '按钮文字', type: 'string', defaultValue: '按钮' },
        { name: 'type', label: '按钮类型', type: 'select', options: [{ label: '主要', value: 'primary' }, { label: '次要', value: 'secondary' }, { label: '危险', value: 'danger' }] },
      ],
    },
    {
      type: 'table',
      name: '表格',
      icon: 'table',
      category: 'display',
      defaultProps: { columns: [], dataSource: [] },
      defaultStyle: { width: '100%' },
      propDefinitions: [
        { name: 'columns', label: '列定义', type: 'json', defaultValue: [] },
        { name: 'dataSource', label: '数据源', type: 'json', defaultValue: [] },
      ],
    },
    {
      type: 'chart',
      name: '图表',
      icon: 'chart',
      category: 'chart',
      defaultProps: { chartType: 'line', option: {} },
      defaultStyle: { width: '100%', height: 300 },
      propDefinitions: [
        { name: 'chartType', label: '图表类型', type: 'select', options: [{ label: '折线图', value: 'line' }, { label: '柱状图', value: 'bar' }, { label: '饼图', value: 'pie' }] },
        { name: 'option', label: '图表配置', type: 'json' },
      ],
    },
    {
      type: 'card',
      name: '卡片',
      icon: 'card',
      category: 'layout',
      defaultProps: { title: '卡片标题' },
      defaultStyle: { padding: 16, borderRadius: 8, backgroundColor: '#ffffff' },
      propDefinitions: [
        { name: 'title', label: '标题', type: 'string', defaultValue: '卡片标题' },
      ],
      allowedChildren: ['text', 'input', 'select', 'button', 'chart', 'image'],
    },
    {
      type: 'grid',
      name: '网格布局',
      icon: 'grid',
      category: 'layout',
      defaultProps: { columns: 2, gap: 12 },
      defaultStyle: { display: 'grid', gap: 12 },
      propDefinitions: [
        { name: 'columns', label: '列数', type: 'number', defaultValue: 2 },
        { name: 'gap', label: '间距', type: 'number', defaultValue: 12 },
      ],
      allowedChildren: ['text', 'input', 'select', 'button', 'table', 'chart', 'card', 'image', 'container'],
    },
    {
      type: 'tabs',
      name: '标签页',
      icon: 'tabs',
      category: 'layout',
      defaultProps: { tabs: [{ key: 'tab1', label: '标签1' }], activeKey: 'tab1' },
      defaultStyle: { width: '100%' },
      propDefinitions: [
        { name: 'tabs', label: '标签列表', type: 'json' },
        { name: 'activeKey', label: '当前激活', type: 'string' },
      ],
      allowedChildren: ['text', 'input', 'select', 'button', 'table', 'chart', 'card', 'container'],
    },
    {
      type: 'image',
      name: '图片',
      icon: 'image',
      category: 'display',
      defaultProps: { src: '', alt: '' },
      defaultStyle: { width: 200, height: 200 },
      propDefinitions: [
        { name: 'src', label: '图片地址', type: 'string' },
        { name: 'alt', label: '替代文本', type: 'string' },
      ],
    },
  ];

  builtins.forEach((meta) => registry.register(meta));
}