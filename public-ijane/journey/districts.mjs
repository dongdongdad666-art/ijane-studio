import * as T from './vendor/three.module.js';

export const districtAtZ=z=>z<=-74?Math.min(7,4+Math.floor((-74-z)/24)):Math.max(0,Math.min(3,Math.floor((3-z)/18)));

export function createDistricts(h){
 const {root,solid,box,line,label,plant,leaf,windowFrame,bench,picture,lantern,C,glass}=h;
 const moving=[];
 function arch(g,x,y,z,w,height,color=C.paper){
  const r=w/2,shoulder=height-r,shape=new T.Shape();
  shape.moveTo(-r,0);shape.lineTo(r,0);shape.lineTo(r,shoulder);shape.absarc(0,shoulder,r,0,Math.PI,false);shape.lineTo(-r,0);
  solid(g,new T.ShapeGeometry(shape),glass,[x,y,z],undefined,false);
  const pts=[new T.Vector3(x-r,y,z+.05),new T.Vector3(x-r,y+shoulder,z+.05)];
  for(let k=0;k<=20;k++){const a=Math.PI-k*Math.PI/20;pts.push(new T.Vector3(x+r*Math.cos(a),y+shoulder+r*Math.sin(a),z+.05));}
  pts.push(new T.Vector3(x+r,y,z+.05));
  line(g,pts.map(p=>[p.x,p.y,p.z]),'#94a7ac');
  const outer=[[-r-.045,0],[-r-.045,shoulder]];
  for(let k=0;k<=20;k++){const a=Math.PI-k*Math.PI/20;outer.push([(r+.045)*Math.cos(a),shoulder+(r+.045)*Math.sin(a)]);}
  outer.push([r+.045,0]);line(g,outer.map(([xx,yy])=>[x+xx,y+yy,z+.052]),'#a1afb1');
  box(g,w+.12,.045,.05,color,x,y,z+.05);box(g,.028,height-r,.035,C.deep,x,y+(height-r)/2,z+.03);
 }
 function roundWindow(g,x,y,z,r){
  solid(g,new T.CircleGeometry(r,32),C.glass,[x,y,z],undefined,false);
  solid(g,new T.RingGeometry(r-.025,r+.025,32),C.paper,[x,y,z+.012],undefined,false);
  line(g,Array.from({length:41},(_,i)=>[x+r*Math.cos(i*Math.PI/20),y+r*Math.sin(i*Math.PI/20),z+.018]),'#94a7ac');
  box(g,r*1.9,.025,.025,C.deep,x,y,z+.025);box(g,.025,r*1.9,.025,C.deep,x,y,z+.025);
 }
 function frame(g,width,height,color){
  box(g,width,.15,6.2,C.light,0,0,0);box(g,width,height,.16,color,0,height/2,-2.9);
  for(const x of [-width/2,width/2])box(g,.17,height,6,color,x,height/2,0);
  box(g,width,.36,.2,C.paper,0,.18,3);box(g,width,.2,6.3,C.paper,0,height,0);
 }
 function crate(g,x,y,z,w=.72){
  box(g,w,.58,w,C.wood,x,y+.29,z);
  for(const xx of [-1,1])box(g,.06,.59,.025,C.paper,x+xx*w*.38,y+.29,z+w*.51);
  for(let k=0;k<3;k++)line(g,[[x-w*.48,y+.12+k*.17,z+w*.51],[x+w*.48,y+.12+k*.17,z+w*.51]],C.deep);
 }
 function parcel(g,x,y,z,size=.65,color=C.paper){
  box(g,size,size*.75,size*.7,color,x,y+size*.375,z);box(g,size*.15,size*.76,size*.71,C.wood,x,y+size*.375,z);
  label(g,'IJ',size*.3,size*.21,x-size*.23,y+size*.4,z+size*.36,C.deep,color);
 }
 function pencil(g,x,z,height,color){
  solid(g,new T.CylinderGeometry(.105,.105,height,6),color,[x,height/2+.15,z]);
  solid(g,new T.ConeGeometry(.105,.35,6),C.wood,[x,height+.32,z]);solid(g,new T.ConeGeometry(.04,.13,6),C.deep,[x,height+.49,z]);
 }
 function bird(g,x,y,z,scale=1){
  const b=new T.Group();b.position.set(x,y,z);b.scale.setScalar(scale);g.add(b);
  const shape=new T.Shape();shape.moveTo(-.8,.15);shape.lineTo(-.1,-.18);shape.lineTo(.8,.4);shape.lineTo(.27,-.2);shape.lineTo(.05,-.48);shape.lineTo(-.28,-.15);shape.closePath();
  solid(b,new T.ShapeGeometry(shape),C.paper);line(b,[[-.8,.15,.01],[-.1,-.18,.01],[.05,-.48,.01]]);return b;
 }
 function desk(g,x,z,width=3.4){
  box(g,width,.12,1.2,C.wood,x,1.15,z);for(const xx of [-width*.4,width*.4])box(g,.08,1.15,.85,C.deep,x+xx,.58,z);
  for(let k=0;k<4;k++){const sheet=box(g,.56,.012,.75,C.paper,x-width*.3+k*.54,1.23+k*.014,z);sheet.rotation.y=(k-1.5)*.18;}
  box(g,1.1,.75,.08,C.deep,x+.7,1.66,z-.15);label(g,'WORK IN PROGRESS',.98,.59,x+.7,1.66,z-.1,C.ink,C.blue);
 }
 function lamp(g,x,y,z){
  line(g,[[x,y+1.5,z],[x,y,z]],C.deep);
  solid(g,new T.ConeGeometry(.3,.23,16),C.deep,[x,y,z]);solid(g,new T.SphereGeometry(.12,10,6),'#f7ebce',[x,y-.12,z],undefined,false);
 }
 function tileWall(g,x,y,z,w,height){
  for(let a=0;a<5;a++)for(let b=0;b<4;b++){
   const c=[C.sage,'#d5cbb6','#c6d4d5','#e7e1d2','#baa895'][a];
   box(g,w/5-.025,height/4-.025,.1,c,x-w/2+w*(a+.5)/5,y-height/2+height*(b+.5)/4,z+(a%2)*.025);
  }
 }

 function retail(g,index){
  const height=7.4+(index%2)*.9,width=8.8;colorize(g,0,index);frame(g,width,height,C.paper);
  box(g,width,height-4.2,.2,index%2?C.blue:'#e1e2d5',0,(height+4.2)/2,3);
  for(const x of [-2.8,0,2.8]){arch(g,x,.42,3.14,2.45,3.45);windowFrame(g,x,height-1.7,3.15,1.3,1.75,C.deep);}
  for(let k=0;k<5;k++)box(g,1.73,.35+(2-Math.abs(k-2))*.23,.5,C.paper,-3.46+k*1.73,height+.2+(2-Math.abs(k-2))*.115,3);
  for(let k=0;k<12;k++){const awning=box(g,.73,.06,1.3,k%2?C.paper:C.blue,-4.02+k*.73,4.15,3.55);awning.rotation.x=.13;box(g,.73,.3,.06,k%2?C.paper:C.blue,-4.02+k*.73,3.93,4.18);}
  label(g,['包装事务所','日常陈列室','一日商店'][index%3],5.8,.5,0,4.65,3.16);
  for(let k=0;k<8;k++)parcel(g,-3.4+k*.95,.85,2.65,.44+(k%3)*.12,[C.paper,C.sage,C.clay][k%3]);
  box(g,7.9,.12,.7,C.wood,0,.8,2.65);
  for(const xx of [-3.3,3.3]){crate(g,xx,.06,3.8,.8);parcel(g,xx,.65,3.8,.7,C.paper);}
  const trolley=new T.Group();trolley.position.set(index%2?2.9:-2.9,.05,4);g.add(trolley);
  box(trolley,1,.08,.7,C.deep,0,.25,0);for(const xx of [-.37,.37])solid(trolley,new T.CylinderGeometry(.13,.13,.08,12),C.deep,[xx,.13,.1],[0,0,Math.PI/2]);parcel(trolley,0,.3,0,.65,C.sage);
  line(trolley,[[-.48,.24,-.2],[-.48,1.05,-.2],[.48,1.05,-.2],[.48,.24,-.2]],C.deep);
  picture(g,index%2?'shunlu.webp':'phase.webp',0,2.65,-2.8,2.4,2.3);
 }
 function material(g,index){
  const height=7.8+(index%2)*.7;frame(g,8.8,height,'#e6e0cf');
  box(g,8.8,2.2,.2,'#d9d3c1',0,height-1.1,3);box(g,9.1,.3,.6,C.paper,0,height+.1,3);
  for(const x of [-3.8,0,3.8]){box(g,.52,5.8,.65,C.paper,x,2.9,3.14);box(g,.7,.28,.85,C.wood,x,.15,3.2);}
  for(let k=0;k<9;k++)box(g,.13,.24,2.2,C.wood,-4+k,5.5,3.5);
  box(g,8.7,.2,.18,C.wood,0,5.38,4.45);
  tileWall(g,-1.8,2.4,-2.75,3.5,3.5);label(g,'色彩与触感',3.1,.42,-1.8,4.55,-2.73);
  for(let k=0;k<4;k++){const slab=box(g,1.35,2.5,.16,['#d9c3a9',C.sage,C.blue,C.paper][k],-2.8+k*.48,1.4,2.5+k*.13);slab.rotation.z=(k-1.5)*.09;}
  box(g,2.6,.55,1.3,C.paper,1.9,.35,2.3);solid(g,new T.SphereGeometry(.43,16,10),C.wood,[1.9,.95,2.3]);
  box(g,2,2.3,.08,'#879f9d',2.1,3.6,-2.75);arch(g,2.1,2.35,-2.68,2.1,2.6,C.wood);
  for(let k=0;k<7;k++)box(g,.08,1.25,.12,C.wood,-3.4+k*1.1,height-1.05,3.19);
  label(g,index%2?'材质图书馆':'光 · 材 · 居',4.4,.55,0,6.15,3.16);
  for(const x of [-3.25,3.25])plant(g,x,.1,4.05,1.15);
  for(let k=0;k<3;k++)box(g,1.05,.15,1.2,['#d6d5c7',C.sage,C.paper][k],-3.2,.16+k*.15,3.9);
  // A vine follows the timber portico rather than repeating retail balconies.
  const stem=[];for(let k=0;k<12;k++){const x=-3.9+k*.7,y=5.35+.14*Math.sin(k*.8);stem.push([x,y,4.53]);leaf(g,x,y,4.55,.6,k%2?1.9:-1.7);}line(g,stem,'#9baea0');
 }
 function maker(g,index){
  frame(g,8.8,5.3,index%2?'#e0cbb7':'#c3d2ce');
  for(let bay=0;bay<2;bay++){
   const x=-2.2+bay*4.4,base=5.1+(bay===index%2?.65:0),peak=1.6+(bay*.3),color=bay===0?'#dac0aa':C.blue;
   box(g,4.35,1.5,.2,color,x,4.65,3);
   const s=new T.Shape();s.moveTo(-2.2,0);s.lineTo(-.25,peak);s.lineTo(2.2,0);s.closePath();solid(g,new T.ShapeGeometry(s),color,[x,base,3.1]);
   for(const dir of [-1,1]){const roof=box(g,2.75,.12,6.5,C.paper,x+dir*1.1,base+peak*.5,0);roof.rotation.z=-dir*Math.atan2(peak,2.2);}
   roundWindow(g,x,base+.55,3.18,.43);arch(g,x,.3,3.13,3.3,3.7,C.paper);
   label(g,bay?'印 · 玩':'造 · 物',2.4,.4,x,4.45,3.18);
  }
  for(let k=0;k<5;k++){pencil(g,-3.6+k*.32,3.85,.85+(k%3)*.2,[C.blue,C.clay,C.sage][k%3]);}
  box(g,1.9,.07,.07,C.wood,-2.95,.6,3.86);
  box(g,2.5,.12,1.1,C.wood,1.8,1,3.7);for(const x of [.85,2.75])box(g,.09,1,.7,C.deep,x,.5,3.7);
  for(let k=0;k<3;k++){const print=label(g,['想象','试一试','再来一次'][k],.7,.9,.9+k*.8,1.62,3.75,C.ink,[C.sage,C.paper,C.blue][k]);print.rotation.z=(k-1)*.11;}
  bird(g,-1.6,2.1,2.65,1.5);bird(g,2.2,2.65,2.55,.9);
  picture(g,'otherspace.webp',0,2.8,-2.75,2.7,2.5);bench(g,2.5,4.05);plant(g,-3.8,.1,4.1,.7);
 }
 function atelier(g,index){
  const height=8.3+(index%2)*.8;frame(g,8.8,height,C.paper);
  // Clear industrial bays reveal the studio interior; no repeated shutter windows.
  for(let k=0;k<5;k++){const x=-3.5+k*1.75;windowFrame(g,x,height*.5,3.14,1.58,height-.4,C.deep);}
  box(g,8.8,.16,.23,C.deep,0,4.6,3.18);box(g,8.9,.32,.3,C.blue,0,height-.05,3.12);
  for(let k=0;k<3;k++){
   const x=-3.1+k*2.9,s=new T.Shape();s.moveTo(-1.4,0);s.lineTo(1.2,1.45);s.lineTo(1.2,0);s.closePath();
   solid(g,new T.ShapeGeometry(s),C.blue,[x,height,3.08]);
   const roof=box(g,3,.09,6.5,C.paper,x,height+.72,0);roof.rotation.z=Math.atan2(1.45,2.6);
   box(g,.08,1.5,6.4,C.deep,x+1.2,height+.75,0);
  }
  desk(g,-1.7,2.25,3.5);desk(g,2,0,3);
  label(g,index%2?'体验制作间':'草图工作室',4.7,.55,0,4.55,3.4);
  for(let k=0;k<6;k++){const print=label(g,['IDEA','01','02','REVIEW','03','MAKE'][k],.92,1.25,-3.1+k*1.23,3.6,-2.75,C.ink,k%2?C.paper:C.blue);print.rotation.z=Math.sin(k)*.07;}
  for(const x of [-2.6,0,2.6])lamp(g,x,5.9,1.5);
  picture(g,index%2?'phase.webp':'otherspace.webp',0,6.15,-2.75,3.6,2.4);
  const rolls=new T.Group();rolls.position.set(-3.4,.1,3.9);g.add(rolls);
  for(let k=0;k<4;k++){const roll=solid(rolls,new T.CylinderGeometry(.15,.15,1.2,12),C.paper,[k*.23,.7,0]);roll.rotation.z=(k-1.5)*.08;}
  box(g,1.2,.65,.65,C.wood,-3.05,.4,3.95);plant(g,3.8,.08,3.8,.95);
 }
 function colorize(g,district,index){g.name=`district-${district}-bay-${index}`;g.userData.district=district;}
 const slots=[12,3,-6,-15,-24,-33,-42,-51,-60,-69],landmarks=[-6,-24,-42,-60];
 for(const side of [-1,1])slots.forEach((z,index)=>{
  if(landmarks.some((v,i)=>v===z&&(i%2===0?-1:1)===side))return;
  const district=districtAtZ(z),g=new T.Group();g.position.set(side*(district===1?7.05:6.65),.16,z+(side===1?.35:0));g.rotation.y=-side*Math.PI/2;root.add(g);colorize(g,district,index);
  [retail,material,maker,atelier][district](g,index+(side===1?1:0));
 });

 // The route changes above and below the eye as well as along the facades.
 for(const z of [5,-7]){
  for(let k=0;k<9;k++){const cloth=box(root,.78,.045,1.9,k%2?C.paper:'#c2d5dd',-3.12+k*.78,5.25,z);cloth.rotation.z=(k-4)*.018;}
  for(const x of [-3.5,3.5])line(root,[[x,5.25,z-1],[x,6.2,z+1]],C.deep);
 }
 for(const z of [-17,-26]){
  for(const x of [-3.5,3.5])box(root,.2,5.4,.2,C.wood,x,2.7,z);
  box(root,7.5,.18,.23,C.wood,0,5.4,z);
  for(let k=0;k<6;k++)box(root,.11,.15,3,C.wood,-3+k*1.2,5.55,z);
  for(let k=0;k<7;k++)leaf(root,-3.2+k*1.05,5.45,z,.75,k%2?1.8:-1.5);
 }
 for(const z of [-35,-45]){
  const pts=[];for(let k=0;k<=20;k++){const t=k/20;pts.push([-3.7+t*7.4,5.6-.7*Math.sin(t*Math.PI),z]);}line(root,pts,C.deep);
  for(let k=0;k<5;k++){const b=bird(root,-2.5+k*1.25,4.8+.12*Math.abs(k-2),z,.58+(k%2)*.2);line(root,[[b.position.x,b.position.y+.25,z],[b.position.x,5.6-.7*Math.sin((k+1)/6*Math.PI),z]]);moving.push(b);}
 }
 for(const z of [-55,-65]){
  for(const x of [-3.65,3.65])box(root,.12,6.3,.12,C.deep,x,3.15,z);
  box(root,7.5,.13,.15,C.deep,0,6.3,z);for(let k=0;k<4;k++)box(root,.06,.08,3.1,C.deep,-3+k*2,6.33,z);
  solid(root,new T.PlaneGeometry(7.2,3),glass,[0,6.3,z],[-Math.PI/2,0,0],false);
  for(const x of [-1.8,1.8])lamp(root,x,5.2,z);
 }
 // Individual paving fields make the two middle stages read differently at walking height.
 for(let z=-16;z>-33;z-=1.65)for(let x=-2.1;x<2.7;x+=1.4)box(root,1.35,.014,1.59,((Math.round(-z/1.65)+Math.round(x))%3===0)?'#ded8c7':'#e6e5da',x,.025,z);
 for(let z=-34;z>-51;z-=1.8){
  for(const x of [-2.4,2.4])solid(root,new T.CircleGeometry(.15,8),Math.round(z)%2?C.clay:C.blue,[x,.031,z],[-Math.PI/2,0,0],false);
 }
 for(let z=-52;z>-74;z-=2.1){line(root,[[-2.72,.035,z],[2.72,.035,z]],'#b2c0c2');for(const x of [-2.45,2.45])box(root,.035,.012,1.8,C.deep,x,.032,z);}

 function enhanceHero(b,i){
  // The landmark shop inherits its district's structural language.
  if(i===0){
   for(const x of [-2.35,0,2.35])arch(b.front,x,.6,.1,2.05,3.5,C.paper);
   for(let k=0;k<5;k++)box(b.roof,1.45,.26+(.5-Math.abs(k-2)*.15),.3,C.blue,-2.9+k*1.45,.15,3.18);
   crate(b.props,2.8,.15,4.25,.6);parcel(b.props,2.8,.75,4.25,.55);
  }else if(i===1){
   for(const x of [-3.45,0,3.45])box(b.front,.36,5.2,.6,C.paper,x,2.6,.2);
   for(let k=0;k<8;k++)box(b.front,.1,.2,2.0,C.wood,-3.45+k*.98,5.3,.7);
   tileWall(b.front,-2.45,6.75,.16,1.75,2.1);tileWall(b.front,2.45,6.75,.16,1.75,2.1);
   label(b.front,'MATERIAL / LIBRARY',3.0,.34,0,6.9,.17);
  }else if(i===2){
   roundWindow(b.front,0,6.65,.24,.7);arch(b.front,1.8,.7,.14,2.55,3.2,C.paper);
   for(let k=0;k<6;k++)pencil(b.props,-3.2+k*.28,4.3,.75+(k%3)*.12,[C.sage,C.clay,C.blue][k%3]);
   bird(b.front,-1.4,6.6,.45,1.2);bird(b.front,2.1,6.65,.45,.8);
  }else{
   for(let k=0;k<6;k++)box(b.front,.08,3.1,.18,C.deep,-3+k*1.2,7.3,.2);
   label(b.front,'从草图，到可以体验',4.5,.5,0,6.6,.3);
   for(let k=0;k<4;k++){const note=label(b.back,['定义目标','制作试验','修改评审','整合体验'][k],1.25,.8,-2.3+k*1.5,3.3,.12);note.rotation.z=(k%2?.05:-.04);}
   for(const x of [-2.3,0,2.3])lamp(b.props,x,4.2,.8);
  }
 }
 return {moving,enhanceHero,update(time){moving.forEach((bird,i)=>{bird.rotation.y=Math.sin(time*.45+i)*.16;bird.rotation.z=Math.sin(time*.6+i)*.035;});}};
}
