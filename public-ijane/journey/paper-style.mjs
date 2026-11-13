import * as T from './vendor/three.module.js';

// Fine paper fibres, rather than a photograph of folded paper stretched onto every face.
export function createPaperTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fcfcf9';ctx.fillRect(0,0,512,512);
 let seed=91;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<64000;i++){ctx.fillStyle=`rgba(109,122,123,${.04+random()*.07})`;ctx.fillRect(random()*512,random()*512,1,1);}
 ctx.strokeStyle='rgba(112,125,127,.045)';ctx.lineWidth=.6;
 for(let i=0;i<1100;i++){const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+1+random()*3,y+random()*.8);ctx.stroke();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(2,2);texture.anisotropy=4;return texture;
}

// Small, deterministic departures from ruler-straight strokes. Never time-based jitter.
export function drawnEdges(geometry){
 const source=new T.EdgesGeometry(geometry,36),a=source.attributes.position,out=[];
 const p=new T.Vector3(),q=new T.Vector3(),direction=new T.Vector3(),normal=new T.Vector3(),point=new T.Vector3();
 for(let i=0;i<a.count;i+=2){
  p.fromBufferAttribute(a,i);q.fromBufferAttribute(a,i+1);direction.subVectors(q,p);const length=direction.length();
  if(length<.0001)continue;
  direction.normalize();normal.crossVectors(direction,Math.abs(direction.z)<.8?new T.Vector3(0,0,1):new T.Vector3(0,1,0)).normalize();
  const count=Math.min(12,Math.max(2,Math.ceil(length/1.2))),amplitude=Math.min(.008,length*.015),phase=p.x*3.1+p.y*1.7+q.z*2.9;
  const pts=[];
  for(let k=0;k<=count;k++){
   const t=k/count,wave=Math.sin(t*Math.PI)*Math.sin(t*7+phase)*amplitude;
   point.copy(p).lerp(q,t).addScaledVector(normal,wave);pts.push(point.clone());
  }
  for(let k=0;k<pts.length-1;k++)out.push(...pts[k].toArray(),...pts[k+1].toArray());
 }
 source.dispose();const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(out,3));return result;
}

export function leafShape(){
 const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.24,.22,-.2,.57,.015,.82);shape.bezierCurveTo(.24,.55,.24,.2,0,0);return shape;
}
