import {useEffect,useRef} from 'react';
import {DefaultLoadingManager} from 'three';
import gsap from 'gsap';
import {useGSAP} from '@gsap/react';
import PaperDrawing from '../../ijane/PaperDrawing.jsx';
import {getChapelScreenTransform,chapelArtwork} from '../../ijane/chapelGeometry.js';
import {subscribeLoading} from '../../ijane/paperLoading.js';
import '../../ijane/paper-loading.css';

gsap.registerPlugin(useGSAP);
const portion=(value,from,to)=>Math.max(0,Math.min(1,(value-from)/(to-from)));
const DRAW_SECONDS=4.6;

export default function Preloader({ready,onComplete}){
  const rootRef=useRef(null),controllerRef=useRef(null);
  const readyRef=useRef(ready),completeRef=useRef(onComplete);
  useEffect(()=>{completeRef.current=onComplete;},[onComplete]);
  useEffect(()=>{readyRef.current=ready;controllerRef.current?.setReady(ready);},[ready]);

  useGSAP((context,contextSafe)=>{
    const root=rootRef.current;
    const sheet=root.querySelector('.paper-loading__sheet');
    const flight=root.querySelector('.paper-loading__flight');
    const flightPaths=[...flight.querySelectorAll('path')];
    const curl=root.querySelector('.paper-loading__curl');
    const footer=root.querySelector('.paper-loading__footer');
    const drawing=root.querySelector('.paper-loading__drawing');
    const paths=[...root.querySelectorAll('.paper-loading__ink path')];
    const fills=[...root.querySelectorAll('.paper-loading__fill')];
    const ink=root.querySelector('.paper-loading__ink');
    const art=root.querySelector('.paper-loading__art');
    const pencil=root.querySelector('.paper-loading__pencil');
    const lengths=paths.map(path=>path.getTotalLength());
    const progress=root.querySelector('.paper-loading__track');
    const label=root.querySelector('.paper-loading__stage');
    const number=root.querySelector('.paper-loading__value');
    const bar=root.querySelector('.paper-loading__bar');
    const hint=root.querySelector('.paper-loading__hint');
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const tracker={value:0},camera={blend:0},paper={bend:1};
    let drawn=false,exiting=false,alive=true,lastPercent=-1,lastStage='';

    const paint=()=>{
      const p=tracker.value;
      for(const path of paths)path.style.strokeDashoffset=String(1-portion(p,Number(path.dataset.from),Number(path.dataset.to)));
      for(const fill of fills)fill.style.opacity=String(portion(p,Number(fill.dataset.from),Number(fill.dataset.to)));
      art.style.opacity=String(portion(p,48,62));
      const reveal=portion(p,48,88)*124;
      art.style.maskImage=`linear-gradient(90deg,#000 ${reveal-24}%,transparent ${reveal}%)`;
      art.style.filter=`grayscale(${1-portion(p,78,100)})`;
      ink.style.opacity=String(1-portion(p,76,94));
      const active=paths.findIndex(path=>p>=Number(path.dataset.from)&&p<Number(path.dataset.to));
      pencil.style.opacity=active>=0&&p<76?'1':'0';
      if(active>=0){
        const path=paths[active],point=path.getPointAtLength(lengths[active]*portion(p,Number(path.dataset.from),Number(path.dataset.to)));
        pencil.setAttribute('transform',`translate(${point.x} ${point.y}) rotate(-28)`);
      }
      bar.style.transform=`scaleX(${p/100})`;
      const percent=Math.floor(p);
      if(percent!==lastPercent){number.textContent=`${percent}%`;progress.setAttribute('aria-valuenow',String(percent));lastPercent=percent;}
      const stage=p<26?'从一张纸、一扇门开始':p<54?'勾勒创作的轮廓':p<78?'添上细节与想象':p<100?'让颜色落在纸上':readyRef.current?'走进纸上的世界':'画好了，等待空间就绪';
      if(stage!==lastStage){label.textContent=stage;lastStage=stage;}
    };
    const layout=()=>{
      drawing.style.width=`${chapelArtwork.width}px`;
      drawing.style.height=`${chapelArtwork.height}px`;
      const w=root.clientWidth,h=root.clientHeight;
      const fit=Math.min(w*.84/chapelArtwork.width,h*.8/chapelArtwork.height);
      const start=[fit,0,0,0,0,fit,0,0,0,0,1,0,(w-chapelArtwork.width*fit)/2,(h-chapelArtwork.height*fit)/2,0,1];
      const end=getChapelScreenTransform(w,h);
      drawing.style.transform=`matrix3d(${start.map((v,i)=>v+(end[i]-v)*camera.blend).join(',')})`;
    };
    const observer=new ResizeObserver(layout);
    observer.observe(root);layout();paint();
    const bendPaper=()=>{
      const b=paper.bend;
      const d=`M0 ${55*b} C280 ${-100*b} 690 ${145*b} 1000 ${-32*b} L1000 ${700-32*b} C690 ${700+145*b} 280 ${700-100*b} 0 ${700+55*b} Z`;
      for(const path of flightPaths)path.setAttribute('d',d);
      curl.style.opacity=String(Math.min(.3,Math.abs(b)*.24));
    };
    bendPaper();
    gsap.set(sheet,{autoAlpha:motion.matches?1:0,rotationX:motion.matches?0:32,rotationZ:motion.matches?0:-11,scale:motion.matches?1:.72,transformPerspective:1600});
    gsap.set(flight,{autoAlpha:motion.matches?0:1,xPercent:-125,yPercent:8,rotationX:48,rotationY:-26,rotationZ:-24,scale:.64,transformPerspective:1600});
    gsap.set(footer,{opacity:motion.matches?1:0});
    pencil.style.opacity='0';

    const finish=contextSafe(()=>{
      if(exiting||!alive||!drawn||!readyRef.current)return;
      exiting=true;
      hint.hidden=true;
      label.textContent='走进纸上的世界';
      const tl=gsap.timeline({onComplete:()=>{if(alive)completeRef.current?.();}});
      const turn=motion.matches?0:.6,travel=motion.matches?0:4.2;
      tl.to(sheet,{rotationX:0,rotationZ:0,scale:1,boxShadow:'0px 0px 0px rgba(54,76,88,0)',duration:travel,ease:'power1.inOut'},turn);
      tl.to(camera,{blend:1,duration:travel,ease:'power1.inOut',onUpdate:layout},turn);
      tl.to([footer,root.querySelector('.paper-loading__paper-note')],{opacity:0,duration:motion.matches?0:.7},turn);
      tl.to(root,{opacity:0,duration:motion.matches?.15:1.2,ease:'power1.inOut'},turn+travel);
    });
    const stop=subscribeLoading(DefaultLoadingManager,event=>{
      if(event.type==='error'&&!exiting)hint.hidden=false;
    });
    const controller={setReady:value=>{if(value)finish();}};
    controllerRef.current=controller;
    const intro=gsap.timeline();
    if(!motion.matches){
      // A curved blank sheet flies in; hand off only once its edges are flat.
      intro.to(flight,{xPercent:3,yPercent:-3,rotationX:24,rotationY:7,rotationZ:-7,scale:.74,duration:1.35,ease:'power2.out'},0);
      intro.to(paper,{bend:-.48,duration:.85,ease:'sine.inOut',onUpdate:bendPaper},0);
      intro.to(paper,{bend:.22,duration:.55,ease:'sine.inOut',onUpdate:bendPaper},.85);
      intro.to(flight,{xPercent:0,yPercent:0,rotationX:32,rotationY:0,rotationZ:-11,scale:.72,duration:.8,ease:'sine.inOut'},1.35);
      intro.to(paper,{bend:0,duration:.75,ease:'sine.out',onUpdate:bendPaper},1.4);
      intro.set(flight,{autoAlpha:0},2.15).set(sheet,{autoAlpha:1},2.15);
      intro.to(footer,{opacity:1,duration:.35},2.15);
    }
    intro.to(tracker,{value:100,duration:motion.matches?0:DRAW_SECONDS,ease:'none',onUpdate:paint,onComplete:contextSafe(()=>{drawn=true;finish();})},motion.matches?0:2.5);
    const slowTimer=window.setTimeout(()=>{if(!readyRef.current&&!exiting&&alive)hint.hidden=false;},12000);
    return ()=>{
      alive=false;stop();observer.disconnect();window.clearTimeout(slowTimer);
      if(controllerRef.current===controller)controllerRef.current=null;
    };
  },{scope:rootRef});

  return <div className="paper-loading" ref={rootRef} aria-label="正在绘制 IJane 创作空间" aria-busy="true">
    <svg className="paper-loading__flight" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="ijane-flight-paper" width="1" height="1" patternContentUnits="objectBoundingBox"><image href="/textures/paper-texture.webp" width="1" height="1" preserveAspectRatio="none" opacity=".11"/></pattern>
        <linearGradient id="ijane-flight-curl" x1="0" x2="1" y1="0" y2=".3"><stop offset="0" stopColor="#597482"/><stop offset=".28" stopColor="#fff"/><stop offset=".6" stopColor="#738996"/><stop offset=".83" stopColor="#fff"/><stop offset="1" stopColor="#8298a3"/></linearGradient>
      </defs>
      <path fill="#f5f2eb"/><path fill="url(#ijane-flight-paper)"/>
      <path className="paper-loading__curl" fill="url(#ijane-flight-curl)"/>
    </svg>
    <div className="paper-loading__sheet"><PaperDrawing/><span className="paper-loading__paper-note" aria-hidden="true">IJane / a place for ideas</span></div>
    <p className="paper-loading__signature">IJane<small>栀远的创作空间</small></p>
    <div className="paper-loading__footer">
      <div className="paper-loading__label"><span className="paper-loading__stage" aria-live="polite">从一扇门开始</span><span className="paper-loading__value" aria-hidden="true">0%</span></div>
      <div className="paper-loading__track" role="progressbar" aria-label="画面绘制进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div className="paper-loading__bar"/></div>
      <p className="paper-loading__hint" hidden>空间仍在准备中，可以稍等或<button className="paper-loading__retry" onClick={()=>window.location.reload()}>重新加载</button></p>
    </div>
  </div>;
}
