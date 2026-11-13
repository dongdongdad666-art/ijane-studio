import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { createTornPaperGeometry } from './TornPaperGeometry';

const FONT = '/fonts/CabinSketch-Regular.ttf';

// A local career note. This room never collects or sends visitor messages.
export default function MessagePaper({ position, onOpen, onBack }) {
    const group = useRef();
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);
    const geometry = useMemo(() => createTornPaperGeometry(1.51, 1.7), []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    useFrame(({ clock }) => {
        if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.005;
    });
    return <group ref={group} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geometry} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={event => { event.stopPropagation(); onOpen(); }}>
            <meshBasicMaterial color="#f5efd9" side={THREE.DoubleSide} />
        </mesh>
        <Text position={[0, 0.51, 0.025]} font={FONT} fontSize={0.17} color="#2c302b">IJane</Text>
        <Text position={[0, 0.08, 0.025]} font={FONT} fontSize={0.075} maxWidth={1.2} textAlign="center" lineHeight={1.6} color="#3f4f42">{'Open to a new chapter.\nAIGC / Visual / Experience'}</Text>
        <Text position={[0, -0.38, 0.025]} font={FONT} fontSize={0.09} color={hovered ? '#74835a' : '#3f4f42'} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={event => { event.stopPropagation(); onOpen(); }}>READ MY NOTE</Text>
        <Text position={[0, -0.65, 0.025]} font={FONT} fontSize={0.065} color="#6d685b" onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)} onClick={event => { event.stopPropagation(); setHovered(false); onBack(); }}>BACK TO THE SEA</Text>
    </group>;
}
