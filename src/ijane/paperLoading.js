export function nextLoadingTarget(previous, loaded, total, ready) {
  if(ready)return 100;
  const fraction=total>0?Math.max(0,Math.min(1,loaded/total)):0;
  return Math.max(previous,fraction*90);
}

// Keep Drei/Three subscribers working, and restore only callbacks we own.
export function subscribeLoading(manager, notify) {
  const originals={},wrappers={};
  for(const key of ['onStart','onProgress','onLoad','onError']){
    originals[key]=manager[key];
    wrappers[key]=(...args)=>{
      if(key==='onLoad')notify({type:'complete'});
      else if(key==='onError')notify({type:'error'});
      else notify({type:'progress',loaded:args[1],total:args[2]});
      originals[key]?.apply(manager,args);
    };
    manager[key]=wrappers[key];
  }
  return ()=>{
    for(const key of Object.keys(wrappers))if(manager[key]===wrappers[key])manager[key]=originals[key];
  };
}
