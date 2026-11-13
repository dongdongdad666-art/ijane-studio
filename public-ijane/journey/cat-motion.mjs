const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const lerp=(a,b,t)=>a+(b-a)*t;
export const CAT_TIMING={notice:.55,firstWalk:3.75,look:5.1,secondWalk:8.5,settle:9.25};
const parked={phase:'seated',x:2.05,z:-40.5,visible:true,walk:0,gait:0,sit:1,heading:-Math.PI/2,headTurn:0,headTilt:.05,bob:0,tail:0,blink:0};

/** Absolute local seconds, independent of frame rate or any camera clock. */
export function catPose(elapsed,reduced=false){
 if(reduced)return {...parked};
 const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0);
 const pose={phase:'notice',x:-2.6,z:-40.5,visible:true,walk:0,gait:0,sit:0,heading:0,headTurn:-1.05,headTilt:0,bob:0,tail:Math.sin(t*1.6)*.09,blink:0};
 if(elapsed<0){pose.phase='waiting';return pose;}
 if(t<CAT_TIMING.notice){
  const u=t/CAT_TIMING.notice;
  pose.headTurn=-1.05*(1-ease(u));pose.bob=-Math.sin(u*Math.PI)*.012;
 }else if(t<CAT_TIMING.firstWalk){
  const u=(t-CAT_TIMING.notice)/(CAT_TIMING.firstWalk-CAT_TIMING.notice);
  pose.phase='crossing';pose.x=lerp(-2.6,-.15,ease(u));pose.walk=Math.sin(Math.PI*u);pose.headTurn=0;
 }else if(t<CAT_TIMING.look){
  pose.phase='look';pose.x=-.15;
  pose.headTurn=-1.45*ease((t-CAT_TIMING.firstWalk)/.28);
  pose.headTilt=Math.sin(clamp((t-CAT_TIMING.firstWalk)/.5)*Math.PI/2)*.09;
  pose.tail+=.11*ease((t-CAT_TIMING.firstWalk)/.4);
 }else if(t<CAT_TIMING.secondWalk){
  const u=(t-CAT_TIMING.look)/(CAT_TIMING.secondWalk-CAT_TIMING.look);
  pose.phase='crossing';pose.x=lerp(-.15,parked.x,ease(u));pose.walk=Math.sin(Math.PI*u);
  pose.headTurn=-1.45*(1-ease((t-CAT_TIMING.look)/.38));
 }else{
  const sit=ease((t-CAT_TIMING.secondWalk)/(CAT_TIMING.settle-CAT_TIMING.secondWalk));
  pose.phase=sit===1?'seated':'settling';pose.x=parked.x;pose.sit=sit;pose.heading=-Math.PI/2*sit;
  pose.headTurn=0;pose.headTilt=.05*sit;pose.tail*=.65;
 }
 pose.gait=(pose.x+2.6)*Math.PI*2/.62;
 pose.bob+=Math.sin(pose.gait*2)*.009*pose.walk;
 const blinkTime=t%6;
 if(blinkTime>4.55&&blinkTime<4.72)pose.blink=Math.sin((blinkTime-4.55)/.17*Math.PI);
 return pose;
}

/** Pure progression: a completed/skipped crossing stays completed until returning to the street entrance. */
export function advanceCat(previous,{progress,time,reduced=false}){
 const p=clamp(Number.isFinite(progress)?progress:0);
 const clock=Math.max(previous?.time??0,Number.isFinite(time)?time:previous?.time??0);
 let state=previous?{...previous}:{...catPose(-1),elapsed:0,startedAt:null,time:clock,done:false,lastProgress:p};
 if(p<.08&&!reduced&&state.phase!=='waiting')state={...catPose(-1),elapsed:0,startedAt:null,time:clock,done:false,lastProgress:p};
 state.time=clock;state.lastProgress=p;
 if(reduced)return {...state,...catPose(0,true),elapsed:Math.max(state.elapsed,CAT_TIMING.settle),done:true};
 if(state.phase==='passed')return state;
 if(state.done){
  const elapsed=Math.max(state.elapsed,state.startedAt===null?CAT_TIMING.settle:clock-state.startedAt);
  return {...state,...catPose(elapsed),elapsed,done:true};
 }
 // Camera z = 10 - 78p. Beyond this point the crossing is less than 2.6 m ahead:
 // skip it rather than spawning a moving animal beneath a fast-moving visitor.
 if(p>.615)return {...state,...catPose(0,true),phase:'passed',visible:false,done:true};
 if(state.startedAt===null&&p>=.49&&p<=.66)state.startedAt=clock;
 if(state.startedAt===null)return {...state,...catPose(-1)};
 const elapsed=Math.max(state.elapsed,clock-state.startedAt),pose=catPose(elapsed);
 return {...state,...pose,elapsed,done:pose.phase==='seated'};
}
