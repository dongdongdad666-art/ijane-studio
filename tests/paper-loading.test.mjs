import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera, Vector3} from 'three';
import {nextLoadingTarget, subscribeLoading} from '../src/ijane/paperLoading.js';
import {chapelFraming, getChapelScreenTransform} from '../src/ijane/chapelGeometry.js';

test('resource progress never completes before scene readiness or moves backwards on a new batch',()=>{
  let p=nextLoadingTarget(0,5,10,false);
  assert.ok(p>0&&p<100);
  const previous=p;
  p=nextLoadingTarget(p,5,40,false);
  assert.equal(p,previous);
  p=nextLoadingTarget(p,40,40,false);
  assert.ok(p<100);
  assert.equal(nextLoadingTarget(p,0,0,true),100);
  assert.equal(nextLoadingTarget(0,0,0,false),0);
});

test('loading subscriptions preserve other listeners and cleanly survive remount',()=>{
  const seen=[],original=(...args)=>seen.push(args);
  const manager={onStart:original,onProgress:original,onLoad:original,onError:original};
  for(let mount=0;mount<2;mount++){
    const events=[];
    const stop=subscribeLoading(manager,event=>events.push(event));
    manager.onStart('first',0,2); manager.onProgress('first',1,2); manager.onLoad(); manager.onError('missing');
    assert.deepEqual(events.map(e=>e.type),['progress','progress','complete','error']);
    assert.equal(events[1].loaded,1);
    stop();
    for(const key of ['onStart','onProgress','onLoad','onError'])assert.equal(manager[key],original);
  }
  assert.equal(seen.length,8);
});

test('loader doorway aligns with the actual camera at wide, tall and mobile sizes',()=>{
  for(const [width,height] of [[1905,1244],[1440,960],[1920,1080],[390,844],[768,1024]]){
    const m=getChapelScreenTransform(width,height);
    const fov=2*Math.atan(Math.min(chapelFraming.height,chapelFraming.width/(width/height))/12)*180/Math.PI;
    const camera=new PerspectiveCamera(fov,width/height,.1,150);
    camera.position.set(0,.2,6);camera.lookAt(0,.13,-4);camera.updateMatrixWorld();
    const scaleX=width/height<.8?1:1.2;
    for(const [px,py,x,y] of [[571,446,-.94,.65],[960,862,.94,-1.75]]){
      const projected=new Vector3(x*scaleX,y,0).project(camera);
      const w=m[3]*px+m[7]*py+m[15];
      assert.ok(Math.abs((m[0]*px+m[4]*py+m[12])/w-(projected.x+1)*width/2)<.01);
      assert.ok(Math.abs((m[1]*px+m[5]*py+m[13])/w-(1-projected.y)*height/2)<.01);
    }
  }
});
