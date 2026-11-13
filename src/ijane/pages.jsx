import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { projects, featuredIds } from './projects.js';
import { profile } from './profile.js';
import { PageTitle, ProjectCard, ProjectImage, SceneViewport } from './components.jsx';
import { useMobile } from './usePreferences.js';
import PaperIcon from './PaperIcon.jsx';
import { archives } from './creationArchive.js';
import { ArchiveIndexPage } from './CreationArchive.jsx';

const featured = () => featuredIds.map(id => projects.find(p=>p.id===id));
function MetaTitle({title}) {
  useEffect(()=>{ document.title=title+' · IJane Studio'; },[title]);
  return null;
}
export function HomePage() {
  const mobile=useMobile();
  return <><MetaTitle title="栀远的创作工作室"/>
    <section className="home-hero">
      <div className="hero-copy">
        <p className="availability"><span/> 正在寻找 AIGC 岗位机会</p>
        <p className="hello">Hi, I'm IJane.</p>
        <h1>把想法，<br/>做成可体验<br className="desktop-break"/>的作品<span className="ink-dot">。</span></h1>
        <p className="hero-description">我是栀远。以 AI 协作探索视觉、品牌与交互体验，让创意从一个念头，走向可以被感受的现场。</p>
        <div className="hero-actions"><Link className="button primary" to="/works">直接看作品 <span>↗</span></Link><Link id="studio-entry" className="text-link" to="/studio">探索工作室 <span>→</span></Link></div>
        <p className="hero-fields">电商 / 家装 / 文创 <i>—</i> 个人主导 · AI 辅助</p>
      </div>
      <div className="hero-visual">
        {!mobile ? <SceneViewport interactive={false}/> : <div className="mobile-studio-preview"><span className="handwritten">Ideas take shape here.</span><div>{featured().map(p=><Link id={'preview-'+p.id} to={'/works/'+p.id} state={{from:'/',focusId:'preview-'+p.id}} key={p.id}><ProjectImage image={p.cover}/><span>{p.title}</span></Link>)}</div></div>}
        <div className="paper-note"><span className="pin"/>欢迎来到<br/><strong>我的创作现场。</strong><span className="handwritten">make / explore / repeat</span></div>
      </div>
      <div className="hero-bottom"><span>创意判断 → 视觉表达 → 体验迭代</span><a href="#selected">向下看看作品 ↓</a></div>
    </section>
    <section className="section selected-section" id="selected">
      <div className="section-title"><h2>从想法到现场<span className="handwritten">Selected works</span></h2><span className="count">01 — 04</span></div>
      <div className="project-grid">{featured().map((p,i)=><ProjectCard key={p.id} project={p} index={i}/>)}</div>
      <Link className="all-works-link" to="/works">还有一些值得展开的探索 <span>浏览全部 {projects.length} 个项目 ↗</span></Link>
    </section>
    <section className="process-teaser section">
      <div className="process-sketch"><span className="handwritten">a thought, a test,<br/>another possibility.</span><div className="sketch-path"><span>想法</span><i>↗</i><span>尝试</span><i>↘</i><span>判断</span><i>→</i><span>迭代</span></div><span className="small-note">过程里，也藏着答案。</span></div>
      <div><h2>作品背后，<br/>是持续的选择。</h2><p>从概念图筛选、材料实验，到试玩与交互评审，我更关心每一次选择如何让作品接近它的目标。</p><Link className="text-link" to="/process">打开制作工作台 ↗</Link></div>
    </section>
    <section className="closing section"><p>下一次探索，期待一个新的起点。</p><Link to="/about">认识栀远 <span>↗</span></Link></section>
  </>;
}
export function WorksPage(){
 const [search,setSearch]=useSearchParams();
 const filter=['work','personal'].includes(search.get('type'))?search.get('type'):'all';
 const visible=filter==='all'?projects:projects.filter(p=>p.nature===filter);
 return <div className="page-wrap works-page"><MetaTitle title="作品"/><PageTitle number="01 / THE GALLERY" title="作品展厅" description="从真实任务到个人探索，用不同的媒介，寻找合适的表达。"/>
 <div className="archive-works-entry"><Link className="paper-control" to="/archive"><PaperIcon />翻看创作档案</Link></div>
 <div className="filter-bar" role="group" aria-label="按项目性质筛选">
 {[['all','全部'],['work','工作项目'],['personal','个人项目']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setSearch(id==='all'?{}:{type:id},{replace:true})}>{label}<span>{id === 'all' ? projects.length : projects.filter(project => project.nature === id).length}</span></button>)}
 <span className="filter-result" aria-live="polite">{visible.length} 个项目</span></div>
 <div className="project-grid all-projects">{visible.map(p=><ProjectCard key={p.id} project={p} index={projects.findIndex(item=>item.id===p.id)}/>)}</div>
 </div>;
}
export function CasePage(){
 const {id}=useParams(); const location=useLocation(); const navigate=useNavigate();
 const project=projects.find(p=>p.id===id);
 const archive=archives.find(a=>a.id===id);
 const back=()=>navigate(location.state?.from || '/works',{state:location.state?.focusId?{restoreFocus:location.state.focusId}:null});
 useEffect(()=>{
  const handler=e=>{if(e.key==='Escape') navigate(location.state?.from || '/works',{state:location.state?.focusId?{restoreFocus:location.state.focusId}:null});};
  window.addEventListener('keydown',handler); return ()=>window.removeEventListener('keydown',handler);
 },[navigate,location.state]);
 if(!project)return <NotFoundPage/>;
 const next=projects[(projects.indexOf(project)+1)%projects.length];
 return <article className="case-page page-wrap"><MetaTitle title={project.title}/>
 <button className="back-link" onClick={back}><PaperIcon type="back" />返回作品</button>
 <header className="case-heading"><div><p className="case-kind">{project.nature==='work'?'工作项目':'个人项目'} <span>/</span> {project.subtitle}</p><h1>{project.title}</h1><p className="case-summary">{project.summary}</p></div><a className="button primary" href={project.url} target="_blank" rel="noreferrer">在线体验 {project.title}<PaperIcon type="next" /></a></header>
 <figure className="case-hero"><ProjectImage image={project.cover} eager/><figcaption>{project.cover.alt}</figcaption></figure>
 <dl className="case-facts"><div><dt>我的工作</dt><dd>{project.role}</dd></div><div><dt>AI 协作</dt><dd>{project.aiRole}</dd></div><div><dt>创作领域</dt><dd>{project.tags?.join(' / ')}</dd></div></dl>
 {archive&&<aside className="archive-case-entry"><div><h2>这份作品，如何一步步成形？</h2><p>{archive.summary}</p></div><Link className="paper-control" to={'/archive/'+id}><PaperIcon />查看创作档案</Link></aside>}
 <div className="case-content"><nav className="case-index" aria-label="案例章节"><span>阅读这份案例</span>{project.sections.map((s,i)=><a key={i} href={'#chapter-'+i}>{String(i+1).padStart(2,'0')} {s.title}</a>)}</nav>
 <div className="case-sections">{project.sections.map((s,i)=><section key={i} id={'chapter-'+i}><span className="chapter-number">{String(i+1).padStart(2,'0')}</span><h2>{s.title}</h2>{s.body.split('\n').filter(Boolean).map((para,j)=><p key={j}>{para}</p>)}{s.media&&<figure><ProjectImage image={s.media}/><figcaption>{s.media.alt}</figcaption></figure>}</section>)}</div></div>
 <div className="case-end"><a className="text-link" href={project.url} target="_blank" rel="noreferrer">去体验完整项目<PaperIcon type="next" /></a><Link className="text-link" to={'/works/'+next.id} state={{from:'/works'}}>下一份作品：{next.title}<PaperIcon type="next" /></Link></div>
 </article>;
}
export function ProcessPage(){return <ArchiveIndexPage/>;}
export function AboutPage(){return <div className="page-wrap"><MetaTitle title="关于栀远"/><PageTitle number="03 / THE NOTEBOOK" title="你好，我是栀远。" description="也可以叫我 IJane。这个名字，对我来说是“爱自己”。"/>
 <div className="about-layout"><div className="name-sheet"><span className="handwritten">Hi, I'm</span><strong>IJane<span>栀远</span></strong><div className="name-rule"/><p>保持好奇。<br/>认真判断。<br/>让想法发生。</p><small>A creative practice, in progress.</small></div><div className="about-copy"><h2>在不同领域之间，<br/>建立自己的创作方法。</h2><p>{profile.bio}</p><p>我的工作会随着公司阶段和项目需求变化。商品视觉、家装搭配、换色换材质、文创形象、营销内容、短视频漫剧和批量出图，都是实践的一部分。</p><p>在个人项目里，我继续探索品牌、交互和沉浸式空间，关注一个想法能否发展成完整而一致的体验。</p></div></div>
 <section className="industry-map"><h2>经验从不同现场积累</h2><div>{[['电商','商品表达 / 营销内容 / 问题分析'],['家装','产品视觉 / 材料与色彩 / 空间搭配'],['文创','形象探索 / 品牌表达 / 内容创作']].map(([a,b])=><article key={a}><h3>{a}</h3><p>{b}</p></article>)}</div></section>
 <Link className="all-works-link" to="/contact">正在寻找下一个创作现场 <span>了解求职方向 <PaperIcon type="next" /></span></Link>
 </div>;}
export function ContactPage(){return <div className="page-wrap contact-page"><MetaTitle title="联系与求职意向"/><PageTitle number="04 / LET'S CONNECT" title="期待下一次，一起创造。" description="我正在寻找新的 AIGC 相关岗位机会。"/>
 <div className="contact-sheet"><span className="handwritten">Open to a new chapter.</span><h2>IJane <span>栀远</span></h2><p>AIGC 创意工程师 / AIGC 视觉设计师<br/>及与视觉、内容、交互体验相关的创作岗位</p><div className="contact-domains"><span>互联网科技</span><span>电商</span><span>广告</span><span>游戏</span></div>
 {profile.contact&&<a className="button primary" href={'mailto:'+profile.contact}>联系 IJane <PaperIcon type="next" /></a>}
 {profile.resume&&<a className="text-link" href={profile.resume} download>下载简历 ↓</a>}
 <div className="contact-bottom"><p>从创意定义到视觉判断，<br/>从 AI 协作到体验迭代。</p><Link className="text-link" to="/works">先了解我的作品 <PaperIcon /></Link></div></div>
 </div>;}
const rooms=[{id:'gallery',name:'作品展厅',caption:'四个主案例，四种表达方式。',path:'/works',action:'阅读全部作品'},
{id:'process',name:'制作工作台',caption:'样本、分镜和原型，让想法逐步成形。',path:'/process',action:'看看制作过程'},
{id:'about',name:'创作路径',caption:'从电商、家装到文创，实践在这里相遇。',path:'/about',action:'认识栀远'},
{id:'contact',name:'联系角',caption:'给下一段创作，留一个位置。',path:'/contact',action:'了解求职方向'}];
export function StudioPage(){
 const location=useLocation();
 const [search,setSearch]=useSearchParams();const room=rooms.find(r=>r.id===search.get('room'))||rooms[0];
 return <div className="studio-page"><MetaTitle title="探索工作室"/>
 <div className="studio-top"><Link to="/works">← 直接看作品</Link><span className="handwritten">Come on in.</span><span>栀远的创作现场</span></div>
 <SceneViewport room={room.id}/>
 <div className="studio-controls"><nav aria-label="工作室空间">{rooms.map((r,i)=><button id={r.id==='gallery'?'studio-entry':'room-'+r.id} key={r.id} aria-pressed={room.id===r.id} onClick={()=>setSearch({room:r.id},{replace:true})}><span>0{i+1}</span>{r.name}</button>)}</nav>
 <div className="room-info" aria-live="polite"><p>{room.caption}</p><Link className="text-link" to={room.path}>{room.action} ↗</Link></div></div>
 {room.id==='gallery'&&<div className="studio-project-links" aria-label="主案例快捷入口">{featured().map((p,i)=><Link id={'studio-'+p.id} to={'/works/'+p.id} state={{from:location.pathname+location.search,focusId:'studio-'+p.id}} key={p.id}><span>0{i+1}</span>{p.title} ↗</Link>)}</div>}
 </div>;
}
export function NotFoundPage(){return <div className="page-wrap not-found"><MetaTitle title="页面未找到"/><span className="handwritten">A page outside the sketchbook.</span><h1>这一页，还没有画下。</h1><p>可以回到展厅，继续看看已经发生的创作。</p><Link className="button primary" to="/works">回到作品展厅 →</Link></div>;}

