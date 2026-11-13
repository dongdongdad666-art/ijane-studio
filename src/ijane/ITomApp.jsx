import { Component, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Experience from '../components/canvas/Experience.jsx';
import NavigationUI from '../components/ui/NavigationUI.jsx';
import Preloader from '../components/dom/Preloader.jsx';
import PaperTransition from '../components/dom/PaperTransition.jsx';
import { SceneProvider, useScene } from '../context/SceneContext.jsx';
import { AudioProvider } from '../context/AudioManager.jsx';
import { AchievementsProvider } from '../context/AchievementsContext.jsx';
import { PerformanceProvider, usePerformance } from '../context/PerformanceContext.jsx';
import { useDocumentMeta } from '../hooks/useDocumentMeta.js';
import WorkshopPalette from './WorkshopPalette.jsx';
import PaperIcon from './PaperIcon.jsx';
import { projects } from './projects.js';
import JourneyRoom from './JourneyRoom.jsx';
import { WorksPage, CasePage, ProcessPage, AboutPage, ContactPage, NotFoundPage } from './pages.jsx';
import { ArchiveIndexPage, ArchivePage } from './CreationArchive.jsx';
import '../styles/main.scss';
import './studio.css';
import './itom-adaptation.css';
import './workshop-theme.css';
import './paper-controls.css';
import './creation-archive.css';

const roomInfo={
  gallery:['作品画廊',`全部 ${projects.length} 个项目 · 滚轮或左右滑动浏览，点击纸卡翻面查看案例。`,'works'],
  studio:['创作实验室','点击设备翻看各项目过程，也可以展开全部创作档案。','archive'],
  about:['创作旅程','沿街前行，走进八段创作现场。','about'],
  contact:['海边联系站','在码头展开下一段创作的可能。','contact'],
};
class SceneFailure extends Component{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="itom-error"><h1>空间暂时未能打开</h1><p>可以重新加载空间。</p><button onClick={()=>window.location.reload()}>重新加载</button></div>:this.props.children;}
}
function ReaderPosition({panelRef}){
  const location=useLocation();
  useEffect(()=>{
    panelRef.current?.scrollTo({top:0});
    panelRef.current?.querySelector('main')?.focus({preventScroll:true});
  },[location.key,panelRef]);
  return null;
}
function ContentLayer(){
  const {overlayContent,closeOverlay}=useScene();
  const closeRef=useRef(null),panelRef=useRef(null);
  useEffect(()=>{
    if(!overlayContent)return;
    const trigger=document.activeElement;
    closeRef.current?.focus();
    return ()=>{if(trigger?.isConnected)trigger.focus?.({preventScroll:true});};
  },[overlayContent]);
  if(!overlayContent)return null;
  const path=overlayContent.type==='ijane-project'?'/works/'+overlayContent.projectId:'/'+(overlayContent.page||'works');
  const keyboard=event=>{
    event.stopPropagation();
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeOverlay();return;}
    if(event.key==='Tab'){
      const items=Array.from(panelRef.current.querySelectorAll('a[href],button,summary')).filter(el=>el.getClientRects().length&&!el.disabled);
      if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1)?.focus();}
      else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0]?.focus();}
    }
  };
  return <section className="itom-content" role="dialog" aria-modal="true" aria-label="IJane创作档案" ref={panelRef} onKeyDown={keyboard} onWheel={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()}>
    <header className="itom-content-bar"><span>IJane / 创作档案</span><button className="paper-control" ref={closeRef} onClick={closeOverlay} aria-label="关闭内容，回到空间"><span>回到空间</span><PaperIcon type="close" /></button></header>
    <MemoryRouter key={path} initialEntries={[path]}><ReaderPosition panelRef={panelRef}/><main id="main-content" tabIndex={-1}><Routes>
      <Route path="/works" element={<WorksPage/>}/><Route path="/works/:id" element={<CasePage/>}/>
      <Route path="/archive" element={<ArchiveIndexPage/>}/><Route path="/archive/:id" element={<ArchivePage/>}/>
      <Route path="/process" element={<ProcessPage/>}/><Route path="/about" element={<AboutPage/>}/>
      <Route path="/contact" element={<ContactPage/>}/><Route path="*" element={<NotFoundPage/>}/>
    </Routes></main></MemoryRouter>
    <p className="itom-credit">基于 <a href="https://github.com/ITomPoland/portfolio-itom" target="_blank" rel="noreferrer">ITom 开源项目</a>二次创作，保留原空间、门与探索机制。<a href="/LICENSE.txt">MIT 许可</a></p>
  </section>;
}
function AdaptedExperience(){
  const [ready,setReady]=useState(false),[loaded,setLoaded]=useState(false);
  const [inspecting,setInspecting]=useState(false);
  useEffect(()=>{
    const inspect=event=>setInspecting(event.detail===true);
    window.addEventListener('ijane-inspection',inspect);
    return ()=>window.removeEventListener('ijane-inspection',inspect);
  },[]);
  const {settings,tier}=usePerformance();
  const {hasEntered,currentRoom,overlayContent,openOverlay,initialRoom,deeplinkHandled:deeplinkHandledRef,teleportTo,isTeleporting,requestExit}=useScene();
  const onReady=useCallback(()=>setReady(true),[]);
  const onLoaded=useCallback(()=>setLoaded(true),[]);
  useDocumentMeta();
  useEffect(()=>{
    if(initialRoom&&hasEntered&&!deeplinkHandledRef.current){deeplinkHandledRef.current=true;teleportTo(initialRoom);}
  },[initialRoom,hasEntered,deeplinkHandledRef,teleportTo]);
  const info=roomInfo[currentRoom];
  return <div className={`app itom-adaptation${inspecting?' is-inspecting':''}${currentRoom==='about'?' is-journey':''}`}>
    <div className="itom-world" inert={!!overlayContent} aria-hidden={!!overlayContent}>
      <div className="canvas-wrapper"><SceneFailure><Canvas camera={{position:[0,.2,28],fov:60,near:.1,far:150}} dpr={settings.dpr} gl={{antialias:settings.antialias,alpha:false,localClippingEnabled:true,powerPreference:settings.powerPreference}} shadows={settings.shadows}>
        <color attach="background" args={['#F3EDE2']}/><fog attach="fog" args={['#F3EDE2',15,50]}/>
        <WorkshopPalette/>
        <Suspense fallback={null}><Experience isLoaded={loaded} onSceneReady={onReady} performanceTier={tier}/></Suspense>
      </Canvas></SceneFailure></div>
      {loaded&&currentRoom==='about'&&<JourneyRoom/>}
      {loaded&&<>
        <NavigationUI/>
        <header className="ijane-identity"><strong>IJane</strong><span>栀远的创作空间</span></header>
        <button className="ijane-index paper-control" onClick={()=>openOverlay({type:'ijane-page',page:'works'})}><PaperIcon /><span>作品索引</span></button>
        {!hasEntered?<div className="ijane-entry"><p>把想法，变成可以走进去的作品。</p><button className="paper-control" onClick={()=>window.dispatchEvent(new Event('ijane-enter'))}>推门进入 <PaperIcon type="next" /></button></div>:<aside className="ijane-room-caption" aria-live="polite"><h1>{info?info[0]:'欢迎来到 IJane 的创作走廊'}</h1><p>{info?info[1]:'向前滚动，点击两侧房门；也可以打开地图选择空间。'}</p>{info&&<button className="paper-control" disabled={isTeleporting} onClick={()=>openOverlay({type:'ijane-page',page:info[2]})}><PaperIcon /><span>{currentRoom==='studio'?'翻看创作档案':'展开'+info[0]}</span></button>}</aside>}
        {hasEntered&&<nav className="ijane-room-shortcuts" aria-label="空间快捷导航">{Object.entries(roomInfo).map(([id,item])=><button className="paper-control" key={id} disabled={isTeleporting} aria-current={currentRoom===id?'page':undefined} onClick={()=>teleportTo(id)}>{item[0]}</button>)}{currentRoom&&<button className="paper-control" disabled={isTeleporting} onClick={requestExit}>回到走廊</button>}</nav>}
      </>}
      {!loaded&&<Preloader ready={ready} onComplete={onLoaded}/>}<PaperTransition/>
    </div><ContentLayer/>
  </div>;
}
export default function ITomApp(){return <PerformanceProvider><AudioProvider><AchievementsProvider><SceneProvider><AdaptedExperience/></SceneProvider></AchievementsProvider></AudioProvider></PerformanceProvider>;}

