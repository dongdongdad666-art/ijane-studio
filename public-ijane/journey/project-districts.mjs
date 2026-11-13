import * as T from './vendor/three.module.js';

// Four personal-project streets. Their props describe concepts, not manufactured products or trading results.
export function createProjectDistricts(h){
 const {root,solid,box,line,label,plant,leaf,windowFrame,bench,picture,lantern,hangingSign,C,glass}=h;
 const groups=[],interactables=[],moving=[];
 const colors={bread:'#e6d9bf',route:'#baccc0',oven:'#dfbdab',moss:'#d7dfcd',cedar:'#c5d3c4',violet:'#dcddea',core:'#e4c9ac'};
 function polygon(g,points,color,x=0,y=0,z=0){
  const shape=new T.Shape();points.forEach(([px,py],i)=>i?shape.lineTo(px,py):shape.moveTo(px,py));shape.closePath();
  const mesh=solid(g,new T.ShapeGeometry(shape),color,[x,y,z],undefined,false);
  line(mesh,[...points,points[0]].map(([px,py])=>[px,py,.006]),'#91a1a7');return mesh;
 }
 function ring(g,r,x,y,z,color=C.deep,width=.025){
  return solid(g,new T.RingGeometry(r-width,r+width,48),color,[x,y,z],undefined,false);
 }
 function bay(district,side,offset,width,height,color){
  const g=new T.Group();g.position.set(side*7.3,.16,offset);g.rotation.y=-side*Math.PI/2;district.add(g);
  g.userData.streetSide=side;g.userData.width=width;
  box(g,width,.13,6.2,C.light,0,0,0);box(g,width,height,.12,C.paper,0,height/2,-2.9);
  for(const x of [-width/2,width/2])box(g,.13,height,6,color,x,height/2,0);
  box(g,width,.22,.18,C.paper,0,.11,3);box(g,width,.16,6.2,C.paper,0,height,0);
  return g;
 }
 function arch(g,x,y,z,width,height,color=C.paper){
  const radius=width/2,shoulder=height-radius,s=new T.Shape();
  s.moveTo(-radius,0);s.lineTo(radius,0);s.lineTo(radius,shoulder);s.absarc(0,shoulder,radius,0,Math.PI,false);s.closePath();
  solid(g,new T.ShapeGeometry(s),glass,[x,y,z],undefined,false);
  const points=[[-radius,0],[-radius,shoulder]];
  for(let k=0;k<=24;k++){const a=Math.PI-k*Math.PI/24;points.push([radius*Math.cos(a),shoulder+radius*Math.sin(a)]);}
  points.push([radius,0]);line(g,points.map(([px,py])=>[x+px,y+py,z+.015]),'#82989f');
  box(g,width,.04,.035,color,x,y,z+.02);box(g,.025,shoulder,.03,C.deep,x,y+shoulder/2,z+.02);
 }
 function roundPane(g,x,y,z,r){
  solid(g,new T.CircleGeometry(r,48),C.glass,[x,y,z],undefined,false);ring(g,r,x,y,z+.015,C.paper,.045);
  ring(g,r-.07,x,y,z+.02,C.deep,.012);return r;
 }
 function gable(g,width,y,rise,color){
  polygon(g,[[-width/2,0],[0,rise],[width/2,0]],color,0,y,3.04);
  for(const side of [-1,1]){const roof=box(g,Math.hypot(width/2,rise),.055,6.35,C.paper,side*width/4,y+rise/2,0);roof.rotation.z=-side*Math.atan2(rise,width/2);}
 }
 function stool(g,x,y,z){
  box(g,.48,.07,.47,C.wood,x,y+.56,z);for(const sx of [-.17,.17])box(g,.035,.56,.035,C.deep,x+sx,y+.28,z);
  box(g,.46,.44,.035,C.paper,x,y+.78,z-.2);
 }
 function cafeTable(g,x,z){
  solid(g,new T.CylinderGeometry(.43,.43,.045,20),C.paper,[x,.84,z]);box(g,.055,.8,.055,C.deep,x,.42,z);
  for(const dx of [-.25,.25])line(g,[[x,.45,z],[x+dx,.05,z-.15]],C.deep);
  stool(g,x-.78,0,z);stool(g,x+.78,0,z);
  solid(g,new T.CylinderGeometry(.08,.07,.12,12),C.paper,[x-.11,.92,z]);line(g,[[x-.02,.92,z],[x+.02,.92,z+.05],[x-.02,.92,z+.09]],C.deep);
 }
 function loaf(g,x,y,z,scale=1){
  const s=new T.Shape();s.moveTo(-.33,0);s.bezierCurveTo(-.39,.18,-.19,.31,.04,.29);s.bezierCurveTo(.31,.3,.4,.12,.3,0);s.closePath();
  const b=solid(g,new T.ShapeGeometry(s),colors.bread,[x,y,z],undefined,false);b.scale.setScalar(scale);
  line(b,s.getPoints(28).map(p=>[p.x,p.y,.006]),'#adad99');
  for(let k=0;k<3;k++)line(b,[[-.19+k*.17,.08,.01],[-.13+k*.17,.22,.01]],C.paper);
 }
 function paperBag(g,x,y,z,scale=1){
  const bag=new T.Group();bag.position.set(x,y,z);bag.scale.setScalar(scale);g.add(bag);
  box(bag,.48,.68,.17,C.paper,0,.34,0);box(bag,.48,.08,.18,colors.bread,0,.65,.005);
  line(bag,[[-.21,.61,.095],[.19,.6,.095]],'#a7b2a9');label(bag,'顺路',.35,.13,0,.44,.096,C.ink,C.paper);
  line(bag,[[.12,.38,.097],[.12,.13,.097],[-.12,.13,.097]],'#819a8d');
 }
 function bottle(g,x,y,z,color=C.blue){
  box(g,.27,.49,.16,color,x,y+.245,z);box(g,.11,.13,.1,C.paper,x,y+.55,z);
  label(g,'ATLAS',.22,.12,x,y+.24,z+.087,C.ink,C.paper);
 }
 function herbTree(g,x,y,z,height=4.4){
  const tree=new T.Group();tree.position.set(x,y,z);g.add(tree);
  line(tree,[[0,0,0],[.04,height*.36,0],[-.035,height*.7,0],[0,height,0]],'#90a298');
  for(let k=0;k<8;k++){
   const side=k%2?-1:1,yy=.65+k*(height-.95)/8,reach=.38+(k%3)*.12;
   line(tree,[[.015,yy,0],[side*reach,yy+.36,.005]],'#a2b1a6');
   const l=leaf(tree,side*reach,yy+.28,.01,.55+(k%2)*.15,side*.7);l.rotation.y=side*.12;
  }
  return tree;
 }
 function lightLeaf(g,x,y,z,scale=1,angle=0,color=colors.violet){
  const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);p.rotation.z=angle;g.add(p);
  polygon(p,[[0,0],[-.34,.58],[-.4,1.47],[0,2.2],[.34,1.38],[.28,.53]],color);
  polygon(p,[[0,0],[0,2.2],[.18,1.32],[.14,.45]],C.blue,0,0,.008);
  line(p,[[0,.06,.018],[.045,.89,.018],[0,2.08,.018]],colors.core);
  line(p,[[-.34,.58,.014],[0,.87,.014],[.28,.53,.014]],'#bdc4cf');return p;
 }
 function orbit(g,x,y,z,r){
  const o=new T.Group();o.position.set(x,y,z);g.add(o);ring(o,r,0,0,0,C.deep,.025);
  const tilted=ring(o,r*.83,0,0,.018,'#b9cad0',.018);tilted.scale.x=.35;tilted.rotation.z=.35;
  line(o,[[-r,0,.025],[r,0,.025]],'#a2b4bd');return o;
 }
 function globe(g,x,y,z,r,moon=false){
  solid(g,new T.CircleGeometry(r,48),moon?C.paper:C.blue,[x,y,z],undefined,false);ring(g,r,x,y,z+.018,C.deep,.025);
  if(moon){for(const [a,b,s] of [[-.35,.32,.19],[.27,-.15,.25],[.05,.45,.09],[-.4,-.3,.1]])ring(g,r*s,x+a*r,y+b*r,z+.025,'#c1cbc9',.015);}
  else{
   for(const pts of [[[-.7,.4],[-.35,.64],[-.08,.51],[-.26,.22],[-.09,.06],[-.32,-.13],[-.53,.08]],[[.13,.1],[.57,.3],[.73,.08],[.42,-.16],[.35,-.61],[.09,-.32]]])polygon(g,pts.map(([a,b])=>[a*r,b*r]),C.sage,x,y,z+.023);
   for(const sign of [-1,1]){const rline=[];for(let k=0;k<=20;k++){const a=-Math.PI/2+k*Math.PI/20;rline.push([x+Math.cos(a)*r*.38*sign,y+Math.sin(a)*r,z+.03]);}line(g,rline,'#b6c8ca');}
  }
 }
 function telescope(g,x,y,z){
  for(const a of [0,2.1,4.2])line(g,[[x,y+1,z],[x+Math.cos(a)*.4,y,z+Math.sin(a)*.4]],C.deep);
  const scope=new T.Group();scope.position.set(x,y+1.06,z);scope.rotation.z=-.9;g.add(scope);
  solid(scope,new T.CylinderGeometry(.16,.22,1.15,16),C.paper,[0,.24,0]);ring(scope,.17,0,.24,.18,C.deep);
  line(g,[[x-.25,y+.7,z],[x+.22,y+.95,z]],'#a3b4bb');
 }
 function starMap(g,x,y,z,w=2.7){
  label(g,'地球 / 月球 / 引力之外',w,.31,x,y+1.13,z,C.ink,C.paper);
  box(g,w,1.85,.025,C.paper,x,y,z);const pts=[[-.9,.25],[-.4,.55],[.1,.13],[.65,.48],[.95,-.2],[.2,-.55],[-.6,-.33]];
  line(g,pts.map(([a,b])=>[x+a*w/2.7,y+b,z+.02]),'#a7b9c1');
  pts.forEach(([a,b],i)=>{const px=x+a*w/2.7,py=y+b;line(g,[[px-.055,py,z+.025],[px+.055,py,z+.025]],C.deep);line(g,[[px,py-.055,z+.025],[px,py+.055,z+.025]],C.deep);if(i%2===0)ring(g,.08,px,py,z+.026,C.blue,.012);});
 }
 function infill(district,side,offset,index){
  const g=bay(district,side,offset,6.6,7.5+(index===5?1.3:0),index===5?colors.cedar:C.paper);
  if(index===4){
   box(g,6.6,2.9,.11,colors.route,0,5.9,3);for(const x of [-1.7,1.7]){arch(g,x,.2,3.06,2.2,3.2);windowFrame(g,x,5.8,3.08,1.25,1.8);}
   label(g,offset>0?'转角留一会':'路过，也欢迎',3.6,.39,0,3.85,3.1);plant(g,-2.3,.08,3.95,.9);
  }else if(index===5){
   for(const x of [-2.7,0,2.7]){box(g,.045,8.6,.05,C.deep,x,4.3,3.02);windowFrame(g,x,3.6,3.04,2.45,6.8);}
   gable(g,6.6,8.8,1.25,C.glass);herbTree(g,-1.6,.15,2.7,5.8);herbTree(g,1.9,.15,2.4,4.7);
  }else if(index===6){
   polygon(g,[[-3.3,0],[-3.3,6.8],[-.3,8.5],[3.3,7.4],[3.3,0]],colors.violet,0,0,3.01);
   for(const x of [-2,0,2])windowFrame(g,x,3.15,3.06,1.45,4.6);lightLeaf(g,0,.3,3.3,1.1,.13,C.blue);
  }else{
   box(g,6.6,3,.1,C.blue,0,6,3);for(const x of [-1.8,1.8]){roundPane(g,x,2.4,3.05,1.15);roundPane(g,x,5.8,3.06,.5);}
   label(g,offset>0?'轨道档案':'观测笔记',3.5,.4,0,4.05,3.12);starMap(g,0,2.4,-2.78,3.1);
  }
  return g;
 }

 function bakery(district){
  for(const side of [-1,1]){
   const g=bay(district,side,0,10.9,7.25,colors.route);
   box(g,10.9,3.15,.12,side<0?colors.route:colors.bread,0,5.62,3);box(g,11.25,.16,.45,C.paper,0,7.35,3.1);
   for(const x of [-3.55,0,3.55]){arch(g,x,.25,3.08,3.02,3.37);windowFrame(g,x,5.75,3.12,1.5,1.75);}
   label(g,side<0?'顺 路 面 包':'今天这一炉',5.5,.5,0,4.05,3.16,C.ink,C.paper);
   for(let k=0;k<10;k++){const shade=box(g,1.08,.035,.85,k%2?C.paper:colors.bread,-4.86+k*1.08,3.65,3.36);shade.rotation.x=.08;box(g,1.08,.16,.035,k%2?C.paper:colors.bread,-4.86+k*1.08,3.5,3.78);}
   if(side<0){
    box(g,7.5,.12,.65,C.wood,-.8,1.02,3.35);
    for(let k=0;k<7;k++)loaf(g,-4+k*.9,1.08,3.7,.78+(k%3)*.16);
    for(let k=0;k<3;k++)paperBag(g,2.5+k*.58,1.1,3.42,.8);
    picture(g,'shunlu.webp',.4,2.45,-2.78,2.7,2.6);
    hangingSign(g,'05 顺路面包',-side*3.1,3.9,5,2.1);
   }else{
    cafeTable(g,-2.2,3.95);cafeTable(g,2.3,3.95);
    for(const x of [-4.4,4.4])box(g,.045,2.7,.045,C.deep,x,1.35,3.95);
    line(g,[[-4.4,2.65,3.95],[0,2.48,3.95],[4.4,2.65,3.95]],C.deep);
    for(let k=0;k<5;k++){const card=label(g,['慢一点','麦香','今天','转个弯','顺路'][k],.72,.9,-3.5+k*1.75,2.05,3.96,C.ink,k%2?C.paper:colors.bread);card.rotation.z=(k-2)*.035;}
    label(g,'香气卡 · 个人品牌概念',3.6,.29,0,1.08,3.12);
   }
   for(const offset of [-8.9,8.9])infill(district,side,offset,4);
   plant(g,-4.6,.08,3.95,.9);lantern(g,4.9,3.72);
  }
  for(let z=-9;z<=9;z+=3)for(const side of [-1,1])box(district,.14,.008,.48,colors.oven,side*2.5,.027,z);
 }
 function scent(district){
  for(const side of [-1,1]){
   const g=bay(district,side,0,10.9,7.6,colors.cedar);
   gable(g,11,7.6,2.7,C.glass);
   for(let k=0;k<6;k++){const x=-4.65+k*1.86;windowFrame(g,x,4.05,3.06,1.69,7.1,C.deep);line(g,[[x,7.6,3.07],[0,10.3,3.07]],'#b7c7c3');}
   box(g,10.8,.17,.12,C.wood,0,4.5,3.1);label(g,side<0?'SCENT ATLAS':'气味苗圃',5,.45,0,4.5,3.18);
   for(const x of [-3.8,-1.3,1.3,3.8]){box(g,1.8,.45,.7,colors.moss,x,.35,2.8);herbTree(g,x,.6,2.85,4.2+(x>0?.8:0));}
   if(side<0){
    box(g,4.2,.12,.75,C.paper,0,1.05,3.6);for(let k=0;k<5;k++)bottle(g,-1.6+k*.8,1.12,3.65,k%2?C.blue:colors.moss);
    for(let k=0;k<4;k++){const strip=box(g,.11,.68,.015,C.paper,2.9+k*.19,1.47,3.65);strip.rotation.z=(k-1.5)*.08;}
    hangingSign(g,'06 气味地形',-side*3.2,4.85,5,2.1);picture(g,'scent.webp',0,2.8,-2.78,3.25,2.8);
   }else{
    for(const [x,text] of [[-3.3,'苔藓'],[0,'雪松'],[3.3,'薄雾']]){label(g,text,1.2,.4,x,2.1,3.32);plant(g,x,.1,3.8,1.4);}
    bench(g,0,3.9);label(g,'森林、雾与光的感官叙事',4.8,.32,0,6.45,3.16);
   }
   for(const offset of [-8.9,8.9])infill(district,side,offset,5);
  }
  for(const z of [-7,7]){
   for(const x of [-3.45,3.45])box(district,.055,6.15,.055,C.deep,x,3.08,z);
   box(district,7.0,.055,.055,C.deep,0,6.15,z);
   for(let k=0;k<7;k++)leaf(district,-2.85+k*.95,6.2,z,.68,k%2?1.3:-1.2);
  }
 }
 function phase(district){
  for(const side of [-1,1]){
   const g=bay(district,side,0,10.9,8.1,colors.violet);
   for(let k=0;k<4;k++){
    const x=-4.1+k*2.74,peak=8.25+(k%2)*1.5;
    polygon(g,[[-1.34,0],[-1.34,7.2],[.45,peak],[1.34,7.6],[1.34,0]],k%2?C.paper:colors.violet,x,0,3.02);
    windowFrame(g,x,3.25,3.08,1.9,5.5,C.deep);line(g,[[x,5.95,3.12],[x+.45,peak,3.12]],colors.core);
   }
   label(g,side<0?'相原 · PHASE ORIGIN':'光叶 / 轴台 / 枝网',5.7,.48,0,6.25,3.19);
   if(side<0){
    for(const x of [-3.4,0,3.4]){
     solid(g,new T.CylinderGeometry(.58,.61,.16,16),C.paper,[x,.82,3.55]);box(g,.18,.68,.18,C.deep,x,.4,3.55);
     for(let k=0;k<3;k++)lightLeaf(g,x,.92,3.53+k*.035,.71,(k-1)*.38,k===1?C.blue:colors.violet);
    }
    hangingSign(g,'07 相原',-side*3.2,4.5,5,1.8);picture(g,'phase.webp',0,2.8,-2.78,3.1,2.9);
   }else{
    line(g,[[-4,1.1,3.3],[-2,2.1,3.3],[0,1.5,3.3],[2,2.9,3.3],[4,2,3.3]],'#b8bacc');
    for(let k=0;k<5;k++)lightLeaf(g,-4+k*2,1.1+(k%2)*.65,3.32,.72,(k-2)*.13,k%2?C.blue:colors.violet);
    label(g,'未来材料与空间的概念探索',4.8,.3,0,4.6,3.18);bench(g,0,3.95);
   }
   for(const offset of [-8.9,8.9])infill(district,side,offset,6);
  }
  for(const z of [-8,0,8])for(const side of [-1,1]){
   line(district,[[side*3.65,.15,z],[side*3.65,5.5,z]],'#b5bdc9');
   lightLeaf(district,side*3.65,5.5,z,1.55,side*.73,side<0?colors.violet:C.blue);
  }
 }
 function spaceBay(district,side,offset=0,width=10.9,tail=false){
  const g=bay(district,side,offset,width,7.3,C.blue);
  box(g,width,3.5,.12,C.blue,0,5.55,3);box(g,width+.2,.14,.35,C.paper,0,7.4,3.08);
  for(const x of [-width*.27,width*.27]){roundPane(g,x,2.4,3.06,Math.min(1.65,width*.23));roundPane(g,x,5.85,3.12,.58);}
  const dome=[];for(let k=0;k<=24;k++){const a=Math.PI-k*Math.PI/24;dome.push([Math.cos(a)*width*.37,Math.sin(a)*width*.2]);}dome.push([-width*.37,0]);
  polygon(g,dome,C.glass,0,7.35,3.09);line(g,[[0,7.35,3.11],[0,7.35+width*.2,3.11]],C.deep);
  if(tail){starMap(g,0,2.25,2.9,Math.min(4,width*.58));label(g,offset<-24?'继续，去看更远的地方':'观测档案',Math.min(5,width*.7),.4,0,4.2,3.15);return g;}
  label(g,side<0?'OTHERSPACE 彼岸':'星图观测站',6,.45,0,4.45,3.2);
  globe(g,-2.9,2.4,3.1,1.37,side>0);starMap(g,2.7,2.4,3.12,2.5);
  telescope(g,side<0?1.6:-1.4,.15,3.8);orbit(g,side<0?-3.3:3.5,1.6,3.5,.75);
  if(side<0){hangingSign(g,'08 彼岸',-side*3.3,4.8,5,1.85);picture(g,'otherspace.webp',0,2.9,-2.78,3.2,2.8);}
  else label(g,'人物、舱体与镜头的空间旅程',5.1,.3,0,6.75,3.17);
  return g;
 }
 function otherspace(district){
  for(const side of [-1,1]){
   spaceBay(district,side);for(const offset of [-8.9,8.9])infill(district,side,offset,7);
   spaceBay(district,side,-18,11.9,true);spaceBay(district,side,-28,8,true);
  }
  for(const z of [-6,6]){
   const points=[];for(let k=0;k<=36;k++){const x=-3.7+k*7.4/36;points.push([x,5.75+.65*(1-(x/3.7)**2),z]);}
   line(district,points,'#aabec7');
   for(const x of [-2.35,0,2.35]){ring(district,.18,x,6.03+(x===0?.25:0),z,C.deep,.017);line(district,[[x-.26,6.03+(x===0?.25:0),z],[x+.26,6.03+(x===0?.25:0),z]],'#b4c6ce');}
  }
 }

 [-86,-110,-134,-158].forEach((z,index)=>{
  const district=new T.Group();district.name='project-district-'+(index+4);district.userData.district=index+4;district.position.z=z;root.add(district);
  [bakery,scent,phase,otherspace][index](district);groups.push(district);interactables.push({object:district,station:index+4});
 });
 return {groups,interactables,moving,update(_time){}};
}
