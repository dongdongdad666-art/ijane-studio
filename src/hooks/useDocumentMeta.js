import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext';
const meta={gallery:['/gallery','作品画廊'],studio:['/studio','创作实验室'],about:['/about','创作旅程'],contact:['/contact','海边联系站']};
export function getInitialRoomFromUrl(){return Object.keys(meta).find(id=>meta[id][0]===window.location.pathname)||null;}
export function useDocumentMeta(){
 const {currentRoom,hasEntered,teleportTo,requestExit,overlayContent}=useScene();
 const last=useRef(undefined),popping=useRef(false);
 useEffect(()=>{
  if(!overlayContent)document.title=(meta[currentRoom]?.[1]||'创作走廊')+' · IJane';
  if(last.current===currentRoom)return;
  const path=meta[currentRoom]?.[0]||'/';
  if(!popping.current){
   if(last.current===undefined)window.history.replaceState({room:currentRoom},'',path);
   else window.history.pushState({room:currentRoom},'',path);
  }
  last.current=currentRoom;popping.current=false;
 },[currentRoom,overlayContent]);
 useEffect(()=>{
  const pop=event=>{
   const target=event.state?.room||getInitialRoomFromUrl();
   if(target===currentRoom)return;
   popping.current=true;
   if(!target)requestExit();else if(hasEntered)teleportTo(target);
  };
  window.addEventListener('popstate',pop);return ()=>window.removeEventListener('popstate',pop);
 },[currentRoom,hasEntered,teleportTo,requestExit]);
}
