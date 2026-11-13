import * as T from './vendor/three.module.js';

// Fixed world-space paper cutouts: perspective, scale and occlusion come from walking.
export const CLOUD_LAYOUT=[
 {id:'lane-near',position:[-3.5,13.5,-26],scale:[.9,.7,1],turn:-.12,tilt:-.035},
 {id:'courtyard-mid',position:[4.8,18,-56],scale:[1.4,.95,1],turn:.18,tilt:.025},
 {id:'maker-near',position:[-2.2,14.5,-61],scale:[1.05,.72,1],turn:-.16,tilt:-.02},
 {id:'atelier-mid',position:[3,21,-88],scale:[1.55,1.05,1],turn:.12,tilt:.04},
 {id:'horizon-low',position:[-3.8,17,-104],scale:[1.45,.8,1],turn:-.09,tilt:-.02},
 {id:'horizon-high',position:[1,35,-128],scale:[2.8,1.5,1],turn:.08,tilt:.025},
 {id:'west-far',position:[-15,24,-99],scale:[1.85,.95,1],turn:.24,tilt:-.045},
 {id:'east-far',position:[17,29,-132],scale:[2.5,1.3,1],turn:-.18,tilt:.02},
 {id:'bakery-cloud',position:[-3,16,-112],scale:[1.1,.75,1],turn:.12,tilt:-.02},
 {id:'garden-cloud',position:[3.5,19,-137],scale:[1.35,.9,1],turn:-.16,tilt:.03},
 {id:'phase-cloud',position:[-2,20,-159],scale:[1.5,.9,1],turn:.14,tilt:-.025},
 {id:'orbit-cloud',position:[4,22,-190],scale:[1.5,.9,1],turn:-.1,tilt:.02},
 {id:'new-horizon',position:[-3.5,30,-222],scale:[2.1,1.3,1],turn:.15,tilt:-.03},
];

function cloudShape(variant){
 const s=new T.Shape(),rise=variant*.12;
 s.moveTo(-3.6,-.35);
 s.bezierCurveTo(-4.15,-.25,-4.1,.75,-3.3,.85);
 s.bezierCurveTo(-3.25,1.7+rise,-2.1,1.95+rise,-1.65,1.35);
 s.bezierCurveTo(-1.3,2.6-rise,.65,2.65-rise,1.1,1.55);
 s.bezierCurveTo(1.7,2.05+rise,2.75,1.6,2.8,.9);
 s.bezierCurveTo(4,.85,4.1,-.4,3.15,-.55);
 s.bezierCurveTo(1.8,-.8,-1.1,-.75,-2.2,-.65);
 s.bezierCurveTo(-2.9,-.85,-3.55,-.7,-3.6,-.35);
 return s;
}

export function createClouds(scene){
 const group=new T.Group();group.name='paper-cloud-sky';scene.add(group);
 // Subtle, deterministic paper grain, with no downloaded bitmap or random frame flicker.
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#f6f7f0';ctx.fillRect(0,0,256,128);
 let seed=73;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<3000;i++){ctx.fillStyle=`rgba(86,110,119,${.02+rand()*.035})`;ctx.fillRect(rand()*256,rand()*128,1,1);}
 const paper=new T.CanvasTexture(canvas);paper.colorSpace=T.SRGBColorSpace;
 const face=new T.MeshBasicMaterial({map:paper,color:'#ffffff',toneMapped:false});
 const edge=new T.MeshBasicMaterial({color:'#d9e4e4',toneMapped:false});
 const stroke=new T.LineBasicMaterial({color:'#91a8b2',transparent:true,opacity:.54,toneMapped:false});
 const detail=new T.LineBasicMaterial({color:'#9bb1ba',transparent:true,opacity:.27,toneMapped:false});
 const clouds=[];
 for(let i=0;i<CLOUD_LAYOUT.length;i++){
  const spec=CLOUD_LAYOUT[i],shape=cloudShape(i%3-1),cloud=new T.Group();cloud.name=spec.id;
  cloud.position.set(...spec.position);cloud.scale.set(...spec.scale);cloud.rotation.set(0,spec.turn,spec.tilt);group.add(cloud);
  const geometry=new T.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1,curveSegments:10});
  geometry.translate(0,-.85,0);
  const positions=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(positions.getX(n)+4.2)/8.4,(positions.getY(n)+1.75)/3.5);
  cloud.add(new T.Mesh(geometry,[face,edge]));
  const points=shape.getPoints(12).map(p=>new T.Vector3(p.x,p.y-.85,.19));cloud.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(points),stroke));
  const curve=new T.CubicBezierCurve3(new T.Vector3(-2.7,-.69,.2),new T.Vector3(-2.15,-.39,.2),new T.Vector3(-1.8,-.5,.2),new T.Vector3(-1.48,-.62,.2));
  cloud.add(new T.Line(new T.BufferGeometry().setFromPoints(curve.getPoints(20)),detail));
  clouds.push(cloud);
 }
 return {group,clouds};
}
