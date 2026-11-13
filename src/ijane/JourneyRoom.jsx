import { useEffect, useRef } from 'react';
import { useScene } from '../context/SceneContext.jsx';
import './journey-room.css';

export function JourneyRoomReady({ showRoom, onReady }) {
  useEffect(() => { if (showRoom) onReady?.(); }, [showRoom, onReady]);
  return null;
}

export default function JourneyRoom() {
  const frame = useRef(null);
  const { overlayContent, requestExit, isTeleporting } = useScene();
  const paused = !!overlayContent || isTeleporting;
  useEffect(() => {
    const receive = event => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'ijane-journey-exit') requestExit();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [requestExit]);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: 'ijane-journey-pause', paused }, location.origin);
  }, [paused]);
  return <iframe ref={frame} className="ijane-journey-frame" title="创作旅程：八段创作街区" src="/journey/index.html" onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'ijane-journey-pause', paused }, location.origin)} />;
}
