import * as T from './vendor/three.module.js';
import {createStreet} from './scene.mjs';
import {districtAtZ} from './districts.mjs';
import {cameraPose,stationAt,stops,chapters,clamp,movementScale,isStreetEnd} from './journey.mjs';
import {prepareSignTextures} from './sign-textures.mjs';

const $=s=>document.querySelector(s),canvas=$('#scene');
let hostPaused=false;
addEventListener('message',event=>{
 if(event.origin===location.origin&&event.source===parent&&event.data?.type==='ijane-journey-pause')hostPaused=event.data.paused===true;
});
let renderer;
try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false});}
catch{$('#error').hidden=false;$('#loading').hidden=true;throw Error('WebGL unavailable');}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
// Like the original illustrated rooms, depth comes from perspective and overlap, not lighting.
renderer.shadowMap.enabled=false;
renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NoToneMapping;
const scene=new T.Scene();scene.background=new T.Color('#deeaeb');scene.fog=new T.Fog('#deeaeb',62,130);
const camera=new T.PerspectiveCamera(62,1,.1,180),look=new T.Vector3();
const ground=new T.Mesh(new T.PlaneGeometry(500,500),new T.MeshBasicMaterial({color:'#e8e9e3',toneMapped:false}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.35;scene.add(ground);
await document.fonts.load('24px Cabin');
await prepareSignTextures();
const street=createStreet(scene);
let mobile=innerWidth<600,progress=0,target=0,active=-2,atEnd=false,yaw=0,targetYaw=0;
const started=performance.now(),controls=[...document.querySelectorAll('nav button')];

function resize(){
 mobile=innerWidth<600;renderer.setSize(innerWidth,innerHeight);
 camera.aspect=innerWidth/innerHeight;camera.fov=mobile?76:62;camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();

function closeNote(restore=true){
 const wasOpen=!$('#object-note').hidden;
 $('#object-note').hidden=true;document.body.classList.remove('reading');
 if(restore&&wasOpen)($('#read-note').hidden?canvas:$('#read-note')).focus({preventScroll:true});
}
function go(value,faceForward=false){
 target=clamp(value);if(faceForward)targetYaw=0;closeNote(false);
}
controls.forEach(button=>button.addEventListener('click',()=>go(button.dataset.station!==undefined?stops[+button.dataset.station]:+button.dataset.destination,true)));
function updateText(index){
 active=index;atEnd=isStreetEnd(progress);closeNote(false);
 $('#story-count').textContent=index<0?(atEnd?'把经历带到下一站':'沿着好奇，慢慢向前'):'0'+(index+1)+' / '+chapters[index].en;
 $('#story-title').textContent=index<0?(atEnd?'在这里，继续创作。':'走进我的创作街区'):chapters[index].title;
 $('#story-subtitle').textContent=index<0?(atEnd?'把沿途的观察，带进下一次创作。':'从工作实践出发，走进八段创作现场。'):chapters[index].subtitle;
 $('#story-body').textContent=index<0?'':chapters[index].body;
 $('#read-note').hidden=index<0;
 controls.forEach(button=>{
  const selected=button.dataset.station!==undefined?+button.dataset.station===index:index<0&&+button.dataset.destination===(atEnd?1:0);
  selected?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current');
  if(selected&&innerWidth<=1100)button.scrollIntoView({block:'nearest',inline:'nearest'});
 });
}
function openNote(index){
 if(index<0||!chapters[index])return;
 target=progress;const chapter=chapters[index];
 $('#note-en').textContent=chapter.en;$('#note-title').textContent=chapter.title;
 $('#note-body').replaceChildren(...[chapter.body,chapter.note].map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
 $('#note-tags').textContent=chapter.tags;
 const link=$('#note-link');link.hidden=!chapter.url;if(chapter.url)link.href=chapter.url;else link.removeAttribute('href');
 $('#object-note').hidden=false;document.body.classList.add('reading');
 $('#close-note').focus({preventScroll:true});
}
$('#read-note').addEventListener('click',()=>openNote(active));
$('#close-note').addEventListener('click',()=>closeNote());
$('#replay').addEventListener('click',()=>go(0,true));

canvas.addEventListener('wheel',event=>{
 event.preventDefault();if(!$('#object-note').hidden)return;
 const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
 go(target+Math.sign(delta)*Math.min(Math.abs(delta),180)/4200*movementScale);
},{passive:false});

// Lock each gesture to walking or turning so a diagonal wobble cannot change both.
let pointer=null;
canvas.addEventListener('pointerdown',event=>{
 if(event.button!==0||!$('#object-note').hidden||pointer)return;
 pointer={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,axis:null};
 canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
 if(!pointer||event.pointerId!==pointer.id)return;
 const x=event.clientX-pointer.x,y=event.clientY-pointer.y;
 if(!pointer.axis&&Math.hypot(x,y)>6)pointer.axis=Math.abs(x)>Math.abs(y)?'look':'walk';
 if(pointer.axis==='look')targetYaw=clamp(targetYaw-(event.clientX-pointer.lastX)/Math.max(innerWidth,400)*2.6,-1.1,1.1);
 if(pointer.axis==='walk')go(target+(pointer.lastY-event.clientY)/1800*movementScale);
 pointer.lastX=event.clientX;pointer.lastY=event.clientY;
});
const ray=new T.Raycaster(),mouse=new T.Vector2();
canvas.addEventListener('pointerup',event=>{
 if(!pointer||event.pointerId!==pointer.id)return;
 const dragged=Boolean(pointer.axis);pointer=null;
 if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
 if(dragged||!$('#object-note').hidden)return;
 mouse.set(event.clientX/innerWidth*2-1,-event.clientY/innerHeight*2+1);ray.setFromCamera(mouse,camera);
 const items=street.interactables||[],hits=ray.intersectObjects(street.root.children,true).filter(hit=>hit.object.isMesh);
 if(!hits.length)return;
 let object=hits[0].object;
 while(object&&!items.some(item=>item.object===object))object=object.parent;
 const item=items.find(item=>item.object===object);if(item)openNote(item.station);
});
canvas.addEventListener('pointercancel',()=>{pointer=null;});
canvas.addEventListener('lostpointercapture',()=>{pointer=null;});
addEventListener('keydown',event=>{
 if(event.key==='Escape'){if($('#object-note').hidden&&parent!==window)parent.postMessage({type:'ijane-journey-exit'},location.origin);else closeNote();return;}
 if(event.target instanceof Element&&event.target.closest('button,a,input,aside'))return;
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){
  event.preventDefault();go(target+(event.key==='ArrowDown'?.04:-.04)*movementScale);
 }
 if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
  event.preventDefault();targetYaw=clamp(targetYaw+(event.key==='ArrowRight'?.16:-.16),-1.1,1.1);
 }
 if(event.key==='PageDown'||event.key==='PageUp'){
  event.preventDefault();go(target+(event.key==='PageDown'?.14:-.14)*movementScale);
 }
 if(event.key==='Home'||event.key==='End'){event.preventDefault();go(event.key==='Home'?0:1,true);}
});

let last=performance.now();
function tick(now){
 requestAnimationFrame(tick);if(document.hidden||hostPaused){last=now;return;}
 const dt=Math.min((now-last)/1000,.05);last=now;
 const step=(target-progress)*(1-Math.exp(-dt*4.2));
 progress+=clamp(step,-dt*.18*movementScale,dt*.18*movementScale);
 if(Math.abs(progress-target)<.0001)progress=target;
 yaw+=(targetYaw-yaw)*(1-Math.exp(-dt*12));
 const pose=cameraPose(progress);camera.position.set(...pose.eye);
 look.set(camera.position.x+Math.sin(yaw)*12,camera.position.y,camera.position.z-Math.cos(yaw)*12);
 camera.lookAt(look);camera.updateMatrixWorld();
 street.update(progress,now/1000);
 const next=stationAt(progress);if(next!==active||(next<0&&atEnd!==isStreetEnd(progress)))updateText(next);
 $('#progress-line').style.width=(progress*100)+'%';
 renderer.render(scene,camera);
 if(now-started>600){$('#loading').hidden=true;document.body.dataset.ready='true';}
 document.body.dataset.station=String(active);document.body.dataset.progress=progress.toFixed(3);
 document.body.dataset.cameraHeight=camera.position.y.toFixed(2);document.body.dataset.yaw=yaw.toFixed(3);
 document.body.dataset.district=String(districtAtZ(camera.position.z));
 const cat=street.cat.state;
 document.body.dataset.catState=cat.phase;document.body.dataset.catX=cat.x.toFixed(3);document.body.dataset.catZ=cat.z.toFixed(3);
 document.body.dataset.catTime=cat.elapsed.toFixed(3);document.body.dataset.catVisible=String(cat.visible);
}
requestAnimationFrame(tick);
