import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SceneViewport } from './components.jsx';
import './immersive.css';

const rooms = [
  {id:'gallery',label:'作品展厅',note:'四个项目，四种表达。点击展板，走进作品。',path:'/works',action:'全部作品'},
  {id:'process',label:'制作工作台',note:'想法、样本与实验。在一次次选择中成形。',path:'/process',action:'打开制作笔记'},
  {id:'about',label:'关于栀远',note:'从电商、家装到文创。保持好奇，也爱自己。',path:'/about',action:'翻开我的故事'},
  {id:'contact',label:'联系角',note:'正在寻找 AIGC 创意与视觉相关的岗位机会。',path:'/contact',action:'查看求职方向'},
];
const readingPositions=new Map();

export default function ImmersiveShell({children}) {
  const location=useLocation();
  const navigate=useNavigate();
  const [search]=useSearchParams();
  const room=rooms.find(item=>item.id===search.get('room'))||rooms[0];
  const immersive=location.pathname==='/'||location.pathname==='/studio';
  const [lastRoom,setLastRoom]=useState(()=>rooms.find(item=>item.path===location.pathname)?.id||room.id);
  if(immersive&&lastRoom!==room.id)setLastRoom(room.id);
  const reading=useRef(null);
  const close=useRef(null);
  const previousPath=useRef(null);
  const returnFocus=useRef('studio-entry');
  const sceneRoom=immersive?room.id:lastRoom;
  const selected=rooms.find(item=>item.id===sceneRoom);
  const route=location.pathname+location.search;

  useLayoutEffect(()=>{
    const samePage=previousPath.current===location.pathname;
    previousPath.current=location.pathname;
    if(immersive){
      document.title='IJane · 栀远的创作工作室';
      const target=location.state?.restoreFocus||returnFocus.current;
      document.getElementById(target)?.focus({preventScroll:true});
      return;
    }
    const panel=reading.current;
    if(samePage&&!location.state?.restoreFocus)return ()=>{readingPositions.set(route,panel.scrollTop);};
    const position=readingPositions.get(route);
    panel.scrollTop=location.state?.restoreFocus?(position||0):0;
    const target=location.state?.restoreFocus&&document.getElementById(location.state.restoreFocus);
    (target||close.current)?.focus({preventScroll:true});
    return ()=>{readingPositions.set(route,panel.scrollTop);};
  },[immersive,room.id,route,location.state,location.pathname]);

  const returnToSpace=()=>navigate('/?room='+sceneRoom,{state:{restoreFocus:returnFocus.current}});
  const trapKeys=event=>{
    if(event.key==='Escape'){
      event.preventDefault();event.stopPropagation();returnToSpace();
    }
    if(event.key!=='Tab')return;
    const items=Array.from(reading.current.querySelectorAll('a[href],button,summary,[tabindex="0"]')).filter(el=>el.getClientRects().length&&!el.disabled);
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  };

  return <div className={'immersive-site'+(!immersive?' is-reading':'')}>
    <div className="immersive-world" inert={!immersive} aria-hidden={!immersive}>
      <SceneViewport room={sceneRoom}/>
      <header className="space-header">
        <Link className="wordmark" to="/?room=gallery" aria-label="IJane 工作室入口">IJane<span>Studio</span><i className="wordmark-dot"/></Link>
        <span className="space-status"><i/> AIGC 创意 / 视觉 / 交互</span>
        <Link className="space-index" to="/works" state={{from:'/?room='+sceneRoom}}>作品索引 ↗</Link>
      </header>
      <div className="space-intro" aria-live="polite">
        <span className="handwritten">{sceneRoom==='gallery'?"Hi, I'm IJane.":'Inside the studio.'}</span>
        <h1>{sceneRoom==='gallery'?'欢迎来到我的创作现场。':selected.label}</h1>
        <p>{selected.note}</p>
      </div>
      <footer className="space-navigation">
        <nav aria-label="探索工作室">{rooms.map((item,index)=><Link id={item.id==='gallery'?'studio-entry':'space-'+item.id} aria-current={sceneRoom===item.id?'page':undefined} to={'/?room='+item.id} onClick={()=>{returnFocus.current=item.id==='gallery'?'studio-entry':'space-'+item.id;}} key={item.id}><span>0{index+1}</span>{item.label}</Link>)}</nav>
        <Link className="space-open" to={selected.path} state={{from:'/?room='+sceneRoom}}>{selected.action} <span>↗</span></Link>
      </footer>
      <small className="space-signature">个人主导 · AI 辅助<span>移动鼠标，看看不同角度</span></small>
    </div>
    {!immersive&&<section ref={reading} className="space-reading" role="dialog" aria-modal="true" aria-label="工作室内容" onKeyDown={trapKeys}>
      <div className="space-reading-bar"><span>IJane / 创作档案</span><button ref={close} onClick={returnToSpace} aria-label="关闭内容，返回三维空间">返回空间 <span>×</span></button></div>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <p className="space-credit">基于 <a href="https://github.com/ITomPoland/portfolio-itom" target="_blank" rel="noreferrer">ITom 开源项目</a>二次创作 · <a href="/LICENSE.txt">MIT 许可</a></p>
    </section>}
  </div>;
}
