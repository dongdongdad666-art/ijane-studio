import * as T from './vendor/three.module.js';
import {advanceCat} from './cat-motion.mjs';

/** A paper cat, isolated from the street's static geometry batches. */
export function createStreetCat(root,{solid,line,C}){
 const group=new T.Group();group.name='street-cat';group.userData.dynamic=true;root.add(group);
 const rig=new T.Group();rig.scale.setScalar(.9);group.add(rig);
 const cream='#eeeade',blue='#bcc8ca',ink=C.ink||'#71838b',pink='#cbb0a5';
 const outline=new T.MeshBasicMaterial({color:ink,side:T.BackSide});
 const unitSphere=new T.SphereGeometry(1,16,10);
 function oval(parent,scale,color,position,outlined=true){
  const mesh=solid(parent,unitSphere,color,position,[0,0,0],false);mesh.scale.set(...scale);
  if(outlined){const edge=new T.Mesh(unitSphere,outline);edge.scale.setScalar(1.012);mesh.add(edge);}
  return mesh;
 }
 function paperShape(parent,shape,depth,color,drawContour=true){
  const geometry=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:16});geometry.translate(0,0,-depth/2);
  const mesh=solid(parent,geometry,color,[0,0,0],[0,0,0],false);
  if(drawContour){const points=shape.getPoints(48);for(const side of [-1,1])line(mesh,points.map(p=>[p.x,p.y,side*(depth/2+.001)]),ink);}
  return mesh;
 }
 function paperCurve(parent,points,radius,color){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  const geometry=new T.TubeGeometry(curve,24,radius,7,false);
  const mesh=solid(parent,geometry,color,[0,0,0],[0,0,0],false);
  const edge=new T.Mesh(geometry,outline);edge.scale.setScalar(1.012);mesh.add(edge);return mesh;
 }
 const torso=new T.Group();rig.add(torso);
 const bodyShape=new T.Shape();bodyShape.moveTo(-.31,.215);
 bodyShape.bezierCurveTo(-.39,.26,-.405,.405,-.30,.464);
 bodyShape.bezierCurveTo(-.20,.515,.065,.498,.195,.46);
 bodyShape.bezierCurveTo(.30,.425,.325,.36,.285,.29);
 bodyShape.bezierCurveTo(.23,.205,.095,.182,-.06,.183);
 bodyShape.bezierCurveTo(-.19,.181,-.26,.18,-.31,.215);
 paperShape(torso,bodyShape,.17,cream);
 // Flat saddle ink replaces the separate raised patch on the old sculpted body.
 for(const side of [-1,1]){
  const patchShape=new T.Shape();patchShape.moveTo(-.23,.458);patchShape.bezierCurveTo(-.15,.495,-.015,.489,.066,.467);
  patchShape.bezierCurveTo(.006,.441,-.071,.447,-.12,.433);patchShape.bezierCurveTo(-.17,.422,-.208,.439,-.23,.458);
  solid(torso,new T.ShapeGeometry(patchShape),blue,[0,0,side*.086],[0,0,0],false);
 }
 const haunch=oval(rig,[.17,.175,.115],cream,[-.22,.19,0],false);haunch.visible=false;

 const legs=[];
 for(const front of [false,true])for(const side of [-1,1]){
  const hip=new T.Group();hip.position.set(front?.215:-.235,.28,side*.105);rig.add(hip);
  const upperShape=new T.Shape();upperShape.moveTo(-.043,.018);
  upperShape.bezierCurveTo(-.049,-.04,-.038,-.112,-.032,-.165);upperShape.lineTo(.035,-.165);
  upperShape.bezierCurveTo(.045,-.106,.05,-.038,.04,.018);upperShape.closePath();
  const upper=paperShape(hip,upperShape,.05,cream,false);
  for(const sideZ of [-.026,.026]){
   line(upper,[[-.043,.018,sideZ],[-.044,-.04,sideZ],[-.037,-.115,sideZ],[-.032,-.165,sideZ]],ink);
   line(upper,[[.04,.018,sideZ],[.046,-.046,sideZ],[.041,-.111,sideZ],[.035,-.165,sideZ]],ink);
  }
  const ankle=new T.Group();ankle.position.y=-.145;hip.add(ankle);
  const lowerShape=new T.Shape();lowerShape.moveTo(-.033,.016);
  lowerShape.bezierCurveTo(-.036,-.025,-.024,-.069,-.026,-.094);
  lowerShape.bezierCurveTo(-.035,-.123,-.008,-.132,.025,-.132);
  lowerShape.bezierCurveTo(.071,-.132,.109,-.129,.11,-.112);
  lowerShape.bezierCurveTo(.112,-.092,.069,-.091,.04,-.089);
  lowerShape.bezierCurveTo(.032,-.049,.035,-.011,.034,.016);lowerShape.closePath();
  const paw=paperShape(ankle,lowerShape,.052,cream,false);
  const boundary=lowerShape.getPoints(36).filter(p=>p.y<.015);
  for(const sideZ of [-.027,.027]){
   line(paw,boundary.map(p=>[p.x,p.y,sideZ]),ink);
   line(paw,[[.067,-.109,sideZ],[.065,-.128,sideZ]],ink);
  }
  legs.push({hip,ankle,front,side});
 }

 const head=new T.Group();head.position.set(.32,.495,0);torso.add(head);
 oval(head,[.166,.148,.139],cream,[0,0,0]);
 oval(head,[.032,.048,.064],cream,[.148,-.045,0],false);
 function ear(side){
  const earRoot=new T.Group();earRoot.position.set(-.025,.11,side*.105);head.add(earRoot);
  const points=[[-.045,0,-.058],[.032,0,-.058],[-.025,.155,0],[-.045,0,.058],[.032,0,.058],[-.025,.155,0]];
  const vertices=[...points[0],...points[1],...points[2],...points[3],...points[5],...points[4],...points[1],...points[4],...points[2],...points[0],...points[2],...points[3]];
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
  solid(earRoot,geometry,cream,[0,0,0],[0,0,0],false);
  line(earRoot,[points[1],points[2],points[4]],ink);
  const inner=new T.BufferGeometry();inner.setAttribute('position',new T.Float32BufferAttribute([.034,.019,-.036,-.015,.117,0,.034,.019,.036],3));inner.computeVertexNormals();
  solid(earRoot,inner,pink,[.002,0,0],[0,0,0],false);return earRoot;
 }
 const ears=[ear(-1),ear(1)],eyes=[];
 for(const side of [-1,1]){
  const eye=oval(head,[.009,.026,.018],ink,[.141,.026,side*.066],false);eyes.push(eye);
  oval(head,[.003,.005,.004],cream,[.15,.033,side*.066],false);
  for(const spread of [-1,0,1])line(head,[[.17,-.04,side*.04],[.165,-.043+spread*.009,side*.112],[.15,-.04+spread*.022,side*.21]],ink);
 }
 const noseGeometry=new T.BufferGeometry();noseGeometry.setAttribute('position',new T.Float32BufferAttribute([.181,-.029,-.019,.181,-.029,.019,.185,-.048,0],3));noseGeometry.computeVertexNormals();
 solid(head,noseGeometry,pink,[0,0,0],[0,0,0],false);
 line(head,[[.184,-.048,0],[.181,-.064,0],[.174,-.075,-.02]],ink);
 line(head,[[.181,-.064,0],[.174,-.075,.02]],ink);
 for(const z of [-.035,.035])line(head,[[.11,.121,z],[.135,.095,z*.8]],ink);

 const tail=new T.Group();tail.position.set(-.33,.37,0);torso.add(tail);
 paperCurve(tail,[[0,0,0],[-.16,.045,.005],[-.31,.19,.025],[-.33,.32,.04],[-.235,.355,.055],[-.17,.275,.055]],.027,cream);
 paperCurve(tail,[[-.28,.345,.052],[-.235,.355,.055],[-.17,.275,.055]],.028,blue);
 // Ground contact is a faint paper-grey ellipse, independent of shadow-map aliasing.
 const contact=new T.Mesh(new T.CircleGeometry(.34,32),new T.MeshBasicMaterial({color:ink,transparent:true,opacity:.055,depthWrite:false}));
 contact.rotation.x=-Math.PI/2;contact.scale.set(1.45,.58,1);contact.position.y=.004;group.add(contact);
 const state={};
 function update(progress,time,reduced=false){
  Object.assign(state,advanceCat(Object.keys(state).length?state:null,{progress,time,reduced}));
  group.visible=state.visible;group.position.set(state.x,.018,state.z);rig.rotation.y=state.heading;
  torso.position.y=state.bob-.075*state.sit;torso.rotation.z=.28*state.sit;
  haunch.visible=state.sit>.05;haunch.scale.set(.17,.175*Math.max(.05,state.sit),.115);
  for(const {hip,ankle,front,side} of legs){
   const phase=state.gait+(front?0:Math.PI)+(side===1?Math.PI:0),stride=Math.sin(phase)*state.walk;
   hip.rotation.z=stride*.42+(front?-.05:-.65)*state.sit;
   hip.position.y=.28-(front?0:.10)*state.sit;
   hip.scale.y=1-(front?0:.45)*state.sit;
   ankle.rotation.z=-Math.max(0,-stride)*.58;
   // Solve the paw's lowest point after both joints rotate, keeping soft toes above the paving.
   const a=hip.rotation.z,b=ankle.rotation.z,s=hip.scale.y;
   const px=.04*Math.cos(b)+.098*Math.sin(b),py=-.145+.04*Math.sin(b)-.098*Math.cos(b);
   const vx=Math.sin(a)*Math.cos(b)+Math.cos(a)*s*Math.sin(b);
   const vy=-Math.sin(a)*Math.sin(b)+Math.cos(a)*s*Math.cos(b);
   const bottom=hip.position.y+Math.sin(a)*px+Math.cos(a)*s*py-Math.hypot(.077*vx,.038*vy)*1.025;
   hip.position.y+=Math.max(0,.004-bottom);
  }
  head.rotation.y=state.headTurn;head.rotation.z=state.headTilt-.1*state.sit;
  ears.forEach((ear,index)=>ear.rotation.x=(index?1:-1)*(.06+state.tail*.25));
  tail.rotation.x=state.tail;tail.rotation.z=-.24*state.sit+state.tail*.22;
  eyes.forEach(eye=>eye.scale.y=.026*Math.max(.12,1-state.blink));
  contact.scale.set(1.45-.45*state.sit,.58+.12*state.sit,1);
  group.userData.phase=state.phase;group.userData.catState=state;
  return state;
 }
 update(0,0,false);
 return {group,update,state};
}
