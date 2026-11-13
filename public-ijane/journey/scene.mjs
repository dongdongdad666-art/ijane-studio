import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {locations,originalStreetProgress} from './journey.mjs';
import {createDistricts} from './districts.mjs';
import {createStreetCat} from './cat.mjs';
import {createClouds} from './clouds.mjs';
import {createPaperTexture,drawnEdges,leafShape} from './paper-style.mjs';
import {createProjectDistricts} from './project-districts.mjs';
import {getSignTexture} from './sign-textures.mjs';
const C={ink:'#596f79',paper:'#efefea',blue:'#d6e1e3',deep:'#c3d2d6',sage:'#dce1d5',clay:'#e1d4c9',wood:'#e3ddce',glass:'#dce8e9',light:'#e8e7df'};
const edges=new T.LineBasicMaterial({color:'#7e939b',transparent:true,opacity:.82,toneMapped:false});
const glass=new T.MeshBasicMaterial({color:'#d9e6e8',transparent:true,opacity:.09,depthWrite:false,side:T.DoubleSide,toneMapped:false});
export function createStreet(scene){
 const sky=createClouds(scene);
 const loader=new T.TextureLoader();
 const paper=createPaperTexture();
 const materialCache=new Map();
 function mat(color){if(!materialCache.has(color))materialCache.set(color,new T.MeshBasicMaterial({color,map:paper,side:T.DoubleSide,toneMapped:false}));return materialCache.get(color);}
 function solid(parent,geometry,color,pos=[0,0,0],rotation=[0,0,0],outline=true){const m=new T.Mesh(geometry,typeof color==='string'?mat(color):color);m.position.set(...pos);m.rotation.set(...rotation);if(outline)m.add(new T.LineSegments(drawnEdges(geometry),edges));parent.add(m);return m;}
 const box=(g,w,h,d,color,x=0,y=0,z=0)=>solid(g,new T.BoxGeometry(w,h,d),color,[x,y,z]);
 function cylinder(g,r,h,color,x,y,z,r2=r){return solid(g,new T.CylinderGeometry(r2,r,h,16),color,[x,y,z]);}
 const lineMaterials=new Map();
 function line(g,pts,color=C.ink){if(!lineMaterials.has(color))lineMaterials.set(color,new T.LineBasicMaterial({color,transparent:true,opacity:.72,toneMapped:false}));const l=new T.Line(new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p))),lineMaterials.get(color));g.add(l);return l;}
 function label(g,text,w,h,x,y,z,color=C.ink,bg=C.paper){
  const texture=getSignTexture(text,w,h,color,bg);
  return solid(g,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false}),[x,y,z],undefined,false);
 }
 function leaf(g,x,y,z,scale=1,angle=0){
  const shape=leafShape(),l=new T.Group();l.position.set(x,y,z);l.scale.setScalar(scale);l.rotation.z=angle;g.add(l);
  solid(l,new T.ShapeGeometry(shape),C.sage,undefined,undefined,false);
  line(l,shape.getPoints(18).map(p=>[p.x,p.y,.006]),'#8ca198');line(l,[[0,0,.009],[.035,.35,.009],[.015,.77,.009]],'#8ca198');
  for(let k=0;k<3;k++){const yy=.2+k*.13;line(l,[[.025,yy,.009],[-.11,yy+.1,.009]],'#a5b2a7');}
  return l;
 }
 function plant(g,x,y,z,scale=1){const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);g.add(p);cylinder(p,.25,.42,C.wood,0,.21,0,.3);
  for(let i=0;i<5;i++){const a=(i-2)*.4;line(p,[[0,.35,0],[Math.sin(a)*.3,.64+Math.cos(i)*.06,Math.cos(i)*.025]],'#8ca198');const l=leaf(p,Math.sin(a)*.3,.56+Math.cos(i)*.06,Math.cos(i)*.03,.68+(i%2)*.12,-a*.75);l.rotation.y=(i-2)*.16;}
  return p;
 }
 function windowFrame(g,x,y,z,w,h,color=C.deep){solid(g,new T.PlaneGeometry(w,h),glass,[x,y,z],undefined,false);box(g,w+.12,.045,.045,color,x,y-h/2,z+.035);box(g,w+.12,.045,.045,color,x,y+h/2,z+.035);for(const sx of [-1,1])box(g,.045,h,.045,color,x+sx*w/2,y,z+.035);box(g,.028,h,.035,color,x,y,z+.05);box(g,w,.03,.035,color,x,y+.15,z+.05);}
 function sheet(g,w,h,x,y,z,color=C.paper){const m=box(g,w,h,.025,color,x,y,z);return m;}
 function lantern(g,x,z){const pole=cylinder(g,.045,3.2,C.deep,x,1.6,z);cylinder(g,.22,.15,C.deep,x,.075,z);line(g,[[x,3.1,z],[x,3.65,z],[x+.5,3.65,z]]);solid(g,new T.ConeGeometry(.28,.24,12),C.deep,[x+.5,3.48,z]);solid(g,new T.SphereGeometry(.14,12,8),'#efe1b8',[x+.5,3.32,z],undefined,false);return pole;}
 const root=new T.Group();scene.add(root);
 // Full-scale lane: the camera walks through it, never around a display base.
 box(root,45,.2,240,C.paper,0,-.12,-90);
 const paving=document.createElement('canvas');paving.width=768;paving.height=768;const pc=paving.getContext('2d');
 pc.fillStyle='#eeece5';pc.fillRect(0,0,768,768);
 for(let row=0;row<8;row++)for(let col=-1;col<6;col++){
  const x=col*154+(row%2)*77,y=row*96;
  pc.fillStyle=['#eeece5','#eae9e2','#f0eee7','#eeede7'][(row*3+col+8)%4];
  pc.beginPath();pc.moveTo(x+4,y+5);pc.lineTo(x+77,y+3+(row%2));pc.lineTo(x+149,y+5);pc.lineTo(x+150,y+88);pc.lineTo(x+73,y+91);pc.lineTo(x+3,y+89);pc.closePath();pc.fill();pc.strokeStyle='#afb9b7';pc.lineWidth=1.25;pc.stroke();
 }
 const pavingTexture=new T.CanvasTexture(paving);pavingTexture.colorSpace=T.SRGBColorSpace;pavingTexture.wrapS=pavingTexture.wrapT=T.RepeatWrapping;pavingTexture.repeat.set(1.6,54.4);pavingTexture.anisotropy=8;
 solid(root,new T.PlaneGeometry(5.5,240),new T.MeshBasicMaterial({map:pavingTexture,toneMapped:false}),[0,.012,-90],[-Math.PI/2,0,0],false);
 for(const side of [-1,1]){
  box(root,1.4,.16,240,C.light,side*3.45,.04,-90);
  box(root,.11,.21,240,C.paper,side*2.8,.08,-90);
  for(let z=27;z>-210;z-=1.5)line(root,[[side*2.86,.126,z],[side*4.1,.126,z]],'#a4afab');
  for(let z=15;z>-196;z-=13.5){box(root,.3,.025,.65,C.deep,side*2.67,.025,z);for(let k=0;k<6;k++)line(root,[[side*2.8,.043,z-.26+k*.1],[side*2.54,.043,z-.26+k*.1]],C.paper);}
 }
 const buildings=[],interactables=[],ambient=[];
 function shell(index,{color=C.blue,height=5.4,gable=true}={}){
  const group=new T.Group();const side=index%2===0?-1:1;group.position.set(side*6.65,.16,locations[index]);group.rotation.y=-side*Math.PI/2;root.add(group);
  const eave=height,upper=index===2?2:3.2;height+=upper;
  box(group,8,.12,8,'#e7e7d9',0,0,0);
  const props=new T.Group();group.add(props);
  const back=new T.Group();back.position.set(0,0,-3);group.add(back);box(back,7,height,.12,C.paper,0,height/2,0);
  const left=new T.Group();left.position.set(-3.5,0,0);group.add(left);box(left,.1,height,6,color,0,height/2,0);
  const right=new T.Group();right.position.set(3.5,0,0);group.add(right);box(right,.1,height,6,C.paper,0,height/2,0);
  const front=new T.Group();front.position.set(0,0,3);group.add(front);box(front,7,.35,.17,C.paper,0,.18,0);box(front,7,1.05,.17,color,0,height-.52,0);
  for(const xx of [-3.35,3.35])box(front,.3,height,.25,C.paper,xx,height/2,0);
  box(front,7,upper,.18,color,0,eave+upper/2,0);box(front,7.3,.16,.45,C.paper,0,eave+.03,.1);
  if(index===0)for(const xx of [-1.8,1.8]){box(front,1.6,1.9,.05,'#879da2',xx,eave+1.6,.11);windowFrame(front,xx,eave+1.6,.16,1.65,1.95,C.paper);box(front,1.9,.16,.4,C.deep,xx,eave+.58,.27);}
  box(front,7.4,.16,.55,C.paper,0,height,.12);
  const roof=new T.Group();group.add(roof);
  if(index===0){
   box(roof,7.6,.15,6.6,C.paper,0,.1,0);
   for(let k=0;k<5;k++)box(roof,1.5,.5+(2-Math.abs(k-2))*.38,.3,C.blue,-3+k*1.5,.25+(2-Math.abs(k-2))*.19,3.15);
  }else if(index===3){
   for(let k=0;k<3;k++){const x=-2.5+k*2.5,s=new T.Shape();s.moveTo(-1.25,0);s.lineTo(1.25,1.45);s.lineTo(1.25,0);s.closePath();solid(roof,new T.ShapeGeometry(s),C.blue,[x,0,3.15]);const slope=box(roof,2.9,.1,6.6,C.paper,x,.73,0);slope.rotation.z=Math.atan2(1.45,2.5);box(roof,.08,1.45,6.5,C.deep,x+1.25,.73,0);}
  }else if(gable){
   const shape=new T.Shape();shape.moveTo(-3.75,0);shape.lineTo(0,2);shape.lineTo(3.75,0);shape.closePath();solid(roof,new T.ShapeGeometry(shape),color,[0,0,3.1]);solid(roof,new T.ShapeGeometry(shape),C.paper,[0,0,-3.1]);
   for(const side of [-1,1]){const slope=box(roof,4.25,.09,6.6,C.paper,side*1.87,1.0,0);slope.rotation.z=-side*Math.atan2(2,3.75);}
   line(roof,[[0,2.03,-3.3],[0,2.03,3.3]]);windowFrame(roof,0,.65,3.15,1,.65,C.deep);
  }else{box(roof,7.5,.15,6.5,C.paper,0,0,0);box(roof,7.6,.12,6.6,color,0,.18,0);}
  const b={group,props,front,back,left,right,roof,height,index};buildings.push(b);return b;
 }
 // 01 / storefront: display, packaging, photo light and a striped cloth canopy.
 {
  const b=shell(0,{color:C.blue});const g=b.props;
  windowFrame(b.front,-.95,2.45,.03,4.2,3.5);box(b.front,1.6,3.55,.1,C.blue,2.3,1.95,.1);windowFrame(b.front,2.3,2.65,.17,1.15,1.8);cylinder(b.front,.07,.14,C.wood,2.88,1.5,.25).rotation.x=Math.PI/2;
  label(b.front,'电 商 橱 窗',5.8,.67,0,4.8,.16);
  for(let i=0;i<9;i++){const canopy=box(b.front,.77,.055,1.65,i%2?C.paper:C.blue,-3.08+i*.77,4.1,.67);canopy.rotation.x=.14;box(b.front,.77,.25,.05,i%2?C.paper:C.blue,-3.08+i*.77,3.87,1.48);}
  box(g,4.1,.12,.9,C.wood,-.95,1.15,3.27);
  for(let i=0;i<3;i++){box(g,.55,.7+i*.2,.45,[C.paper,C.sage,C.clay][i],-2.2+i*1.1,1.6+i*.1,3.33);label(g,['IDEA','DAILY','STORY'][i],.45,.22,-2.2+i*1.1,1.65,3.57,C.ink,[C.paper,C.sage,C.clay][i]);}
  const board=label(g,'今天，也要被看见。',2.1,1.6,-2.9,1.0,4.6);board.rotation.y=.18;line(g,[[-3.7,.15,4.6],[-3.7,1.8,4.6],[-3.7,.15,5.1]]);
  plant(g,3.05,.1,4.2,.85);lantern(g,-4.1,4.7);
  picture(g,'returnlens.webp',.65,2.35,2.7,1.5,1.1);label(g,'ReturnLens · 问题复核',1.95,.3,.65,3.12,2.74);
  interactables.push({object:b.front,station:0});
 }
 // 02 / a cutaway material room, with real depth and open walls.
 {
  const b=shell(1,{color:C.sage,height:5.1,gable:false});const g=b.props;
  label(b.front,'材 料 小 屋',5.5,.65,0,4.55,.18);
  for(let i=0;i<7;i++)for(let j=0;j<6;j++)box(g,.9,.035,.9,(i+j)%2?C.paper:'#d7ded3',-2.75+i*.9,.13,-2.3+j*.9);
  for(let i=0;i<5;i++)for(let j=0;j<3;j++)box(b.back,.83,.83,.05,[(C.blue),C.paper,C.sage][(i+j)%3],-2.15+i*.86,1.2+j*.86,.1);
  const fan=new T.Group();g.add(fan);fan.position.set(-1.4,.6,3.7);
  for(let i=0;i<4;i++){const panel=sheet(fan,1.1,2.4,0,1.2,0,[C.sage,C.clay,C.blue,C.paper][i]);panel.rotation.z=(i-1.5)*.18;panel.position.x=(i-1.5)*.5;panel.position.z=i*.035;}
  box(g,2.3,.35,1.3,C.wood,1.1,1,-.3);for(const xx of [.2,2])for(const zz of [-.75,.2])box(g,.1,1,.1,C.deep,xx,.5,zz);
  cylinder(g,.65,.08,C.paper,.7,1.22,-.3);cylinder(g,.2,.6,C.sage,.7,1.55,-.3,.12);
  box(g,1.1,.28,1.2,C.blue,2.1,.65,1.5);box(g,1.1,1.2,.2,C.blue,2.1,1.1,.95);for(const xx of [1.65,2.55])for(const zz of [1.1,1.9])box(g,.08,.6,.08,C.deep,xx,.3,zz);
  const rug=box(g,2.1,.025,1.3,'#dfd6bc',1.8,.17,2.0);rug.rotation.y=.05;
  plant(g,-2.6,.15,-1.9,1.4);plant(g,3.0,.1,3.7,.75);interactables.push({object:b.front,station:1},{object:fan,station:1});
  picture(g,'belite.webp',1.5,2.7,2.5,1.85,1.25);label(g,'BELITE / 选材与比较',2.2,.3,1.5,3.6,2.54);
 }
 function rabbit(g,x,y,z,scale=1){const r=new T.Group();r.position.set(x,y,z);r.scale.setScalar(scale);g.add(r);box(r,.8,.9,.55,C.paper,0,.45,0);const face=box(r,.88,.75,.35,C.paper,0,1.15,.1);face.rotation.z=-.08;for(const xx of [-.25,.25]){const ear=solid(r,new T.ConeGeometry(.18,.95,3),C.paper,[xx,1.9,0]);ear.rotation.z=xx*.5;solid(r,new T.SphereGeometry(.035,8,6),C.ink,[xx*.75,1.2,.3],undefined,false);}solid(r,new T.ConeGeometry(.075,.1,3),C.clay,[0,1.05,.31],[0,0,Math.PI]);box(r,.6,.1,.58,C.blue,0,.85,.02);return r;}
 // 03 / character shop with print samples, a paper rabbit and a little press table.
 {
  const b=shell(2,{color:'#d7b6a1',height:4.8});const g=b.props;
  label(b.front,'文 创 造 物 铺',5.8,.65,0,4.25,.16);
  windowFrame(b.front,1.8,2.3,.04,2.3,2.7);box(b.front,2,3.4,.1,C.paper,-1.8,1.8,.05);label(b.front,'MAKE / PLAY',1.65,.45,-1.8,2.95,.14);sheet(b.front,1.2,1.45,-1.8,1.7,.13,C.sage);
  rabbit(g,1.8,.35,3.5,1.1);rabbit(g,-1.8,1.2,3.6,.55);
  box(g,2.4,.12,1.1,C.wood,-1.8,1.15,3.8);for(const xx of [-2.7,-.9])box(g,.08,1.1,.6,C.deep,xx,.55,3.8);
  for(let i=0;i<3;i++){const poster=label(g,['HELLO','IDEAS','IJANE'][i],.8,1.1,-2.6+i*.85,2.6,3.3,C.ink,[C.sage,C.blue,C.paper][i]);poster.rotation.z=(i-1)*.1;}
  plant(g,-3.2,.1,4,.7);lantern(g,3.8,4.2);interactables.push({object:b.front,station:2});
 }
 // 04 / light-filled studio: the same creative references meet at a desk.
 {
  const b=shell(3,{color:'#acc3d0',height:5.8});const g=b.props;
  label(b.front,'IJane STUDIO',5.5,.65,0,5.2,.18);
  for(const xx of [-2.3,0,2.3])windowFrame(b.front,xx,2.7,.03,2.1,4.1,C.deep);
  box(g,4.6,.15,1.55,C.wood,0,1.5,2.3);for(const xx of [-2.05,2.05])box(g,.12,1.5,1.1,C.deep,xx,.75,2.3);
  box(g,1.5,1.1,.12,C.deep,.45,2.25,2.35);label(g,'IDEA → EXPERIENCE',1.35,.8,.45,2.25,2.43,C.ink,C.blue);box(g,.12,.5,.12,C.deep,.45,1.75,2.3);box(g,.75,.06,.5,C.deep,.45,1.6,2.3);
  for(let i=0;i<3;i++){const swatch=box(g,.5,.03,.6,[C.sage,C.clay,C.blue][i],1.5+i*.15,1.61+i*.04,2.5);swatch.rotation.y=i*.2;}
  cylinder(g,.16,.4,C.paper,-.9,1.8,2.4);for(let i=0;i<4;i++){const pencil=cylinder(g,.018,.6,C.clay,-1+i*.07,2.1,2.4);pencil.rotation.z=(i-1.5)*.12;}
  const avatar=loader.load('./assets/boy.webp');avatar.colorSpace=T.SRGBColorSpace;solid(g,new T.PlaneGeometry(1.6,2.4),new T.MeshBasicMaterial({map:avatar,transparent:true,alphaTest:.1,side:T.DoubleSide}),[-1.7,1.35,2.0],undefined,false);
  plant(g,3.0,.12,3.8,1.2);rabbit(g,-2.7,.2,3.9,.65);
  label(b.back,'IDEAS TAKE SHAPE HERE',4,.45,0,4.1,.1);
  interactables.push({object:b.front,station:3});
 }
 function picture(g,file,x,y,z,w,h){
  box(g,w+.16,h+.16,.08,C.wood,x,y,z-.025);const tex=loader.load('./assets/'+file);tex.colorSpace=T.SRGBColorSpace;
  solid(g,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,toneMapped:false}),[x,y,z+.025],undefined,false);
 }
 function hangingSign(g,text,x,y,z,w=1.25){
  box(g,.07,.07,1.65,C.deep,x,y+.45,z-.45);line(g,[[x,y+.45,z-.8],[x,y+.85,z-1.1],[x,y+.45,z+.3]]);
  const sign=label(g,text,w,.88,x+.006,y,z,C.ink,C.paper);sign.rotation.y=Math.PI/2;sign.material.side=T.FrontSide;
  const reverse=sign.clone();reverse.rotation.y=-Math.PI/2;reverse.position.x=x-.006;g.add(reverse);
  for(const zz of [z-w*.35,z+w*.35])line(g,[[x,y+.45,zz],[x,y+.68,zz]]);
 }
 function bench(g,x,z){
  for(let i=0;i<3;i++)box(g,1.7,.065,.15,C.wood,x,.63,z+i*.18);
  for(const xx of [x-.65,x+.65]){box(g,.065,.65,.48,C.deep,xx,.32,z+.16);box(g,.065,1.15,.065,C.deep,xx,.58,z-.14);}
  for(let i=0;i<3;i++)box(g,1.7,.14,.055,C.wood,x,.78+i*.17,z-.14);
 }
 const districts=createDistricts({root,solid,box,line,label,plant,leaf,windowFrame,bench,picture,lantern,sheet,C,glass});
 const cat=createStreetCat(root,{solid,line,C});
 buildings.forEach((b,i)=>{
  b.roof.position.y=b.height+.05;districts.enhanceHero(b,i);
  hangingSign(b.props,['01 电商橱窗','02 材料小屋','03 文创造物铺','04 IJane 工作室'][i],i%2===0?2.6:-2.6,3.65,4.55,2.05);
  label(b.front,['商品 · 内容','材料 · 空间','形象 · 故事','想法 · 体验'][i],1.75,.35,2.35,.68,.17,C.ink,C.paper);
  for(const x of [-3.1,3.1]){box(b.front,.32,.4,.18,C.deep,x,3.65,.27);box(b.front,.22,.27,.03,'#f4eacb',x,3.65,.38);}
  if(i===0)picture(b.back,'shunlu.webp',-.8,2.8,.1,2.5,2.8);
  if(i===2)picture(b.back,'otherspace.webp',0,2.8,.1,2.6,2.5);
  if(i===3)picture(b.back,'phase.webp',0,2.8,.11,2.5,2.5);
 });
 const projects=createProjectDistricts({root,solid,box,line,label,plant,leaf,windowFrame,bench,picture,lantern,sheet,hangingSign,C,glass});
 interactables.push(...projects.interactables);
 // A framed studio facade ends the vista. No empty tabletop or endless sky.
 const end=new T.Group();end.position.set(0,.16,-188);root.add(end);
 box(end,8.8,9,1.2,C.paper,0,4.5,0);box(end,9.1,.24,1.6,C.blue,0,9,0);
 box(end,4,5.4,.15,C.deep,0,2.8,.68);box(end,3.65,5.1,.12,C.blue,0,2.72,.79);windowFrame(end,0,3.1,.88,3.25,3.9,C.paper);
 // Keep both signs above the 5.5-high door frame, with visible space between them.
 label(end,'IJane',5.6,1.05,0,7.05,.78);label(end,'让想法继续发生',4.2,.5,0,5.98,.78);
 for(const x of [-3.2,3.2]){windowFrame(end,x,6.4,.7,1.15,2.4,C.deep);plant(end,x,.05,1.3,1.6);}
 // Batch immobile paper geometry; preserve shop-front roots for pointer interaction.
 function batch(group){
  group.updateWorldMatrix(true,true);const inverse=group.matrixWorld.clone().invert(),batches=new Map(),originals=[];
  group.traverse(obj=>{
   if((!obj.isMesh&&!obj.isLine)||obj.material.transparent&&obj.isMesh)return;
   const key=[obj.isMesh?'mesh':'line',obj.material.uuid,obj.castShadow,obj.receiveShadow].join(':');
   let geometry=obj.geometry.index?obj.geometry.toNonIndexed():obj.geometry.clone();
   geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,obj.matrixWorld));
   if(obj.isLine&&!obj.isLineSegments){const points=geometry.attributes.position.array,segments=[];for(let k=0;k<points.length-3;k+=3)segments.push(...points.slice(k,k+6));geometry.dispose();geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(segments,3));}
   if(!batches.has(key))batches.set(key,{geometries:[],material:obj.material,mesh:obj.isMesh,cast:obj.castShadow,receive:obj.receiveShadow});batches.get(key).geometries.push(geometry);originals.push(obj);
  });
  // Keep transparent descendants (the glass) before removing their opaque parents.
  const glassPlanes=[];group.traverse(o=>{if(o.isMesh&&o.material.transparent)glassPlanes.push(o);});for(const o of glassPlanes)group.attach(o);
  for(const o of originals){o.removeFromParent();o.geometry.dispose();}
  for(const b of batches.values()){
   const merged=mergeGeometries(b.geometries,false);const mesh=b.mesh?new T.Mesh(merged,b.material):new T.LineSegments(merged,b.material);mesh.castShadow=b.cast;mesh.receiveShadow=b.receive;group.add(mesh);for(const g of b.geometries)g.dispose();
  }
 }
 const scenery=new T.Group();root.add(scenery);
 const heroRoots=new Set([...buildings.map(b=>b.group),...projects.groups]),moving=new Set([...ambient,...districts.moving,...projects.moving,cat.group]);
 for(const child of [...root.children])if(child!==scenery&&!heroRoots.has(child)&&!moving.has(child))scenery.attach(child);
 batch(scenery);
 for(const b of buildings)for(const group of [b.front,b.back,b.left,b.right,b.roof,b.props])batch(group);
 for(const group of projects.groups)batch(group);
 return {root,buildings,interactables,ambient,cat,districts,projects,sky,update(progress,time,reduced=false){
  districts.update(reduced?0:time);projects.update(reduced?0:time);cat.update(originalStreetProgress(progress),time,reduced);
 }};
}
