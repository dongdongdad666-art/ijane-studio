import { projects } from './projects.js';

const categories = {
  'phase-origin': '概念品牌与材质探索', shunlu: '社区品牌体验',
  belite: '家装材料与空间', otherspace: '科幻空间叙事',
  'machine-misread': '交互档案与机器误读', petway: '宠物出行服务原型',
  returnlens: '电商业务与信息设计', 'starry-night': '绘画风格交互叙事',
  'scent-atlas': '气味与感官体验', 'abyssal-genesis': '深海氛围与声音实验',
  'neon-run': '三维街机赛车',
};

// The renderer and the scene share the same copy and dimensions.
export const galleryCopy = [
  { id: 'heading', text: '项目简介', width: .57, height: .14, style: 'heading' },
  { id: 'open', text: '查看案例', width: .57, height: .14, style: 'heading' },
  ...['创意', '视觉', '空间', '交互'].map((text, i) => ({ id: `tag-${i}`, text, width: .21, height: .07, style: 'tag' })),
  ...projects.flatMap(project => [
    { id: `${project.id}-summary`, text: project.summary, width: 1.12, height: .55, style: 'body' },
    { id: `${project.id}-category`, text: categories[project.id], width: 1.1, height: .13, style: 'heading' },
  ]),
];
export const galleryCopyUrl = id => `/ijane/gallery-copy/${id}-v002.webp`;
