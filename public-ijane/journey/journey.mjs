export const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
export const routeLength=184;
// Input travel is measured against the approved 78-unit street, so extending the road never speeds up walking.
export const movementScale=78/routeLength;
export const progressAtZ=z=>clamp((10-z)/routeLength);
export const originalStreetProgress=p=>clamp(p/movementScale);
const stopZ=[-.92,-18.08,-35.24,-52.4,-80,-104,-128,-152];
export const stops=stopZ.map(progressAtZ);
export const locations=[-6,-24,-42,-60,-86,-110,-134,-158];
export const isStreetEnd=p=>p>progressAtZ(-169);
export function stationAt(p){
 if(p<progressAtZ(5.32)||isStreetEnd(p))return -1;
 const z=10-routeLength*clamp(p),boundaries=[5.32,-9.5,-26.66,-43.82,-74,-98,-122,-146];
 for(let i=boundaries.length-1;i>=0;i--)if(z<=boundaries[i])return i;return 0;
}
export function foldAmount(p,i){return smooth((p-(stops[i]-.18))/.17);}
export function cameraPose(progress){
 const z=10-routeLength*clamp(progress);return {eye:[0,1.82,z],target:[0,1.82,z-12]};
}
export function framePose(pose){
 return {eye:[...pose.eye],target:[...pose.target]};
}
export const chapters=[
 {title:'电商橱窗',en:'THE WINDOW',subtitle:'让商品，被看见，也被理解。',body:'从商品主图到营销内容，我关注产品特点如何被看清、信息如何被读懂。AI 参与图像与内容制作，视觉方向和结果筛选由我判断。',object:'橱窗里的包装样本',note:'ReturnLens 是工作项目，围绕 SKU 问题、原因假设、置信度与人工复核组织整改。街边的复核桌借用了这个思路；站点使用演示数据，不代表真实降退货效果。',tags:'工作实践 / 商品表达 / 人工复核',url:'https://returnlens-two.vercel.app/'},
 {title:'材料小屋',en:'THE MATERIAL ROOM',subtitle:'把一块材料，放进空间里思考。',body:'家装与产品设计的经历，让我开始关注材料、色彩、尺度与空间氛围之间的关系。看一张图，也会想它与真实产品的联系。',object:'展开的材料样本册',note:'Belite 是工作项目，连接原砖、空间搭配示意、二维铺贴比较与提案整理。街边陈列使用实际网站封面；AI 空间图用于表达氛围，不替代实物色样和施工确认。',tags:'工作项目 / 材料与色彩 / 交互选材',url:'https://belite-material-studio.vercel.app/'},
 {title:'文创造物铺',en:'THE LITTLE MAKER',subtitle:'给一个形象，留下可以延伸的性格。',body:'文创设计让我关注形象、故事和应用之间的联系。角色可以走进包装、内容和互动，同一个想法也可以拥有不同的表达。',object:'桌边的折纸小兔',note:'文创形象与个人品牌探索，训练的是从一个点子出发，持续判断它是否能形成统一的视觉语言。这里的小兔是为街区制作的空间装饰。',tags:'形象探索 / 品牌表达 / 跨媒介延伸'},
 {title:'IJane 工作室',en:'THINGS COME TOGETHER',subtitle:'让不同经历，在同一张桌子上相遇。',body:'现在，我用 AI 协作连接图像、视频、程序与三维体验。工作方式随任务变化：持续定义目标、评审结果，再把想法推进到可以体验的作品。',object:'我的创作桌',note:'Codex、Claude、Gemini、Lovart、Runway、即梦等工具参与不同制作环节。我的关注点始终是目标、选择与体验，而不只是哪一个工具。',tags:'个人主导 / AI 协作 / 视觉与交互'},
 {title:'顺路面包',en:'THE NEIGHBOURHOOD BAKERY',subtitle:'拐个弯，顺路带点香。',body:'以愚园路公开资料为背景，我构建了虚构的社区品牌“顺路面包”。从路径与转角的识别，到纸袋、香气卡、视频和三维工坊，持续判断同一个创意如何在不同媒介中成立。',object:'门前的纸袋与香气卡架',note:'街区把“今天这一炉”转译成烘焙橱窗、纸袋和户外桌椅。这是个人概念品牌，香气卡为本地组合演示，店铺和陈设不代表真实经营、订单或实物打样。',tags:'个人项目 / 品牌体验 / 内容与互动',url:'https://shunlu-case-study.vercel.app/'},
 {title:'气味花园',en:'SCENT ATLAS',subtitle:'用森林与纸叶，描述看不见的香气。',body:'SCENT ATLAS 将气味词汇转译为森林、薄雾、水滴和滚动节奏。苔藓中调与雪松后调逐步展开，最后收束到香水概念的揭晓。',object:'植物标本与试香纸',note:'纸树、格架和瓶形陈列是为街区设计的空间转译。原作是未发售的个人品牌概念，关注感官叙事与网页体验，不代表真实香水生产或气味检测。',tags:'个人项目 / 感官叙事 / 概念品牌',url:'https://scent-atlas-sage.vercel.app/'},
 {title:'相原温室',en:'PHASE ORIGIN',subtitle:'从一片光叶，生长出一组空间关系。',body:'相原从沉浸式网页探索发展为未来科技概念品牌。我通过概念筛选、模型与材质实验、动画评审和交互迭代，让光叶、轴台、枝网共享蓝紫半透与暖色中轴的视觉线索。',object:'折叶冠廊与概念样本',note:'温室将原项目的材料关系转译为纸面色块和结构线。陈列为概念示意，光叶、轴台与枝网尚未连接实体设备，也不代表已制造产品或真实照度计算。',tags:'个人项目 / 材质语言 / 产品与空间',url:'https://phase-origin-034.vercel.app/'},
 {title:'星图观测街',en:'OTHERSPACE',subtitle:'把熟悉的世界，留在舷窗的另一侧。',body:'OTHERSPACE 用序章、人物、舱体与镜头递进组织太空旅程。候舱、轨道起升与地球回望，让不同尺度的空间相互连接，也让我继续探索网页的连续叙事。',object:'舷窗里的地球与星图',note:'观测街以纸质舷窗、轨道和星图呼应原作，保持当前街区的第一人称路线。原作品是个人网页叙事实验；这里的装置不作航天或轨道物理模拟。',tags:'个人项目 / 空间叙事 / 实时三维',url:'https://otherspace-journey.vercel.app/'},
];
