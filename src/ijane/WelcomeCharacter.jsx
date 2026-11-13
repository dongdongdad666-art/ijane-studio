import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace, Vector3 } from 'three';
import HeroText from '../components/canvas/corridor/HeroText';

const CHARACTER = '/ijane/character/paper-throne-boy-v001.webp';

/** Original paper cutout, confined to the first welcome scene. */
export default function WelcomeCharacter() {
  const size = useThree(state => state.size);
  const portrait = size.width / size.height < 0.85;
  const source = useTexture(CHARACTER);
  const texture = useMemo(() => {
    const copy = source.clone();
    copy.colorSpace = SRGBColorSpace;
    copy.needsUpdate = true;
    return copy;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);

  const character = useRef();
  const ink = useRef();
  const shadow = useRef();
  const worldPosition = useMemo(() => new Vector3(), []);
  const height = portrait ? 2.5 : 2.55;
  const x = portrait ? 0 : -0.95;
  const width = height * source.image.width / source.image.height;

  useFrame(({ camera }, delta) => {
    if (!character.current) return;
    character.current.getWorldPosition(worldPosition);
    const distance = camera.position.z - worldPosition.z;
    // The chair rests on the floor; it yields to the viewer only on approach.
    const approach = 1 - MathUtils.smoothstep(distance, 0.65, 2.65);
    character.current.position.x = MathUtils.damp(character.current.position.x, x - approach * 1.1, 5, delta);
    const opacity = MathUtils.smoothstep(distance, 0.2, 1.15);
    ink.current.opacity = opacity;
    shadow.current.opacity = opacity * 0.1;
  });

  return <>
    <group position={portrait ? [0, 0.85, -0.5] : [0.85, 0.22, -0.5]} scale={portrait ? 0.78 : 0.68}>
      <HeroText position={[0, 0, 0]} />
    </group>
    <group ref={character} position={[x, -1.75, portrait ? -3.7 : -0.7]}>
      <mesh position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial ref={ink} map={texture} transparent alphaTest={0.025} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.008, -0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[width * 0.47, 0.22, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial ref={shadow} color="#65727a" transparent opacity={0.1} depthWrite={false} userData={{ ijanePlainColor: true }} />
      </mesh>
    </group>
  </>;
}
