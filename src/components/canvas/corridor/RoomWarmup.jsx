import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
// Keep the original rooms on demand; avoid mounting four GPU-heavy worlds at startup.
export default function RoomWarmup({onWarmupComplete}) {
  const ready=useRef(false);
  useFrame(()=>{if(!ready.current){ready.current=true;onWarmupComplete?.();}});
  return null;
}
