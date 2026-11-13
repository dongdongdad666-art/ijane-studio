import { Component, lazy, Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { projects, featuredIds } from './projects.js';
import { useReducedMotion } from './usePreferences.js';
import PaperIcon from './PaperIcon.jsx';
const StudioExperience = lazy(() => import('./StudioExperience.jsx'));
export function ProjectImage({image, className='', eager=false}) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!image?.src || failedSrc===image.src) return <div className={'image-fallback '+className}><span>{image?.alt || '项目画面'}</span><small>画面暂时无法载入，仍可阅读案例</small></div>;
  return <img className={className} src={image.src} alt={image.alt} loading={eager ? 'eager':'lazy'} decoding="async" onError={() => setFailedSrc(image.src)} />;
}
export function ProjectCard({project, index, compact=false}) {
  const location = useLocation();
  const focusId = 'project-'+project.id;
  return <article className={'project-card '+(compact ? 'compact':'')}>
    <Link id={focusId} className="project-cover-link" to={'/works/'+project.id} state={{from:location.pathname+location.search,focusId}} aria-label={'查看'+project.title+'案例'}>
      <div className="project-cover"><ProjectImage image={project.cover} /><span className="project-index">{String(index+1).padStart(2,'0')}</span><span className="view-case" aria-hidden="true"><PaperIcon />阅读案例</span></div>
      <div className="project-meta"><h3>{project.title}</h3><span>{project.nature === 'work' ? '工作项目' : '个人项目'}</span></div>
    </Link>
    <p>{project.summary}</p><div className="project-tags">{project.tags?.slice(0,3).map(tag=><span key={tag}>{tag}</span>)}</div>
  </article>;
}
function SceneFallback({message}) {
  const location=useLocation();
  return <div className="scene-fallback"><p>{message || '正在打开工作室…'}</p><div>{featuredIds.map(id=>{
    const project=projects.find(p=>p.id===id);
    return <Link id={'fallback-'+id} key={id} to={'/works/'+id} state={{from:location.pathname+location.search,focusId:'studio-entry'}}><ProjectImage image={project.cover}/><span>{project.title} ↗</span></Link>;
  })}</div></div>;
}
class SceneBoundary extends Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <SceneFallback message="空间暂时无法打开，可以直接浏览作品。" /> : this.props.children;}
}
export function SceneViewport({room='gallery',interactive=true}) {
  const navigate=useNavigate();
  const location=useLocation();
  const reducedMotion=useReducedMotion();
  const [failed,setFailed]=useState(false);
  const ready=useRef(false);
  useEffect(()=>{
    if(failed) return;
    const timeout=setTimeout(()=>{if(!ready.current) setFailed(true);},12000);
    return ()=>clearTimeout(timeout);
  },[failed]);
  const onReady=useCallback(()=>{ready.current=true;},[]);
  const onError=useCallback(error=>{if(import.meta.env.DEV) console.error('IJane scene:',error);setFailed(true);},[]);
  const onNavigate=useCallback(path=>navigate(path,{state:{from:location.pathname+location.search,focusId:'studio-entry'}}),[navigate,location.pathname,location.search]);
  return <div className={'scene-viewport '+(!interactive?'hero-scene':'')} role="region" aria-label="IJane 三维创作工作室">
    {failed ? <SceneFallback message="空间暂时无法打开，可以直接浏览作品。"/> :
      <SceneBoundary><Suspense fallback={<SceneFallback/>}>
        <StudioExperience projects={projects} room={room} reducedMotion={reducedMotion} onNavigate={onNavigate} onError={onError} onReady={onReady}/>
      </Suspense></SceneBoundary>}
    <span className="scene-caption">IJane Studio / {room==='gallery'?'作品展厅':room==='process'?'制作工作台':room==='about'?'创作路径':'联系角'}</span>
    {failed && <button className="scene-retry" onClick={()=>{ready.current=false;setFailed(false);}}>重新打开空间</button>}
  </div>;
}
export function PageTitle({number,title,description}) {
  return <header className="page-title"><span className="section-number">{number}</span><h1>{title}</h1>{description&&<p>{description}</p>}</header>;
}
