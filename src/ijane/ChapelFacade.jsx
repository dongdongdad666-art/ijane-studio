import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { SRGBColorSpace } from 'three';
import { chapelLayout, createChapelGeometry, createPetGeometry } from './chapelGeometry.js';

const keepColor = { ijanePlainColor: true };

const portraitPets = {
  cat: {...chapelLayout.cat,position:[-.72,-1.75,1.5],size:[.44,.72]},
  dog: {...chapelLayout.dog,position:[.78,-1.75,.32],size:[.7,.28]},
};

function Pet({ type, texture, portrait }) {
  const { position, size, uv } = (portrait?portraitPets:chapelLayout)[type];
  const geometry = useMemo(()=>createPetGeometry(size,uv),[size,uv]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <group position={position} name={`chapel-${type}`}>
    <mesh position={[0,.008,0]} rotation={[-Math.PI/2,0,0]} scale={[size[0]*.48,size[0]*.25,1]}>
      <circleGeometry args={[1,32]}/><meshBasicMaterial color="#687983" userData={keepColor} transparent opacity={.13} depthWrite={false}/>
    </mesh>
    <mesh geometry={geometry}>
      <meshBasicMaterial map={texture} transparent alphaTest={.35} toneMapped={false}/>
    </mesh>
  </group>;
}

export default function ChapelFacade({ texture }) {
  const { size } = useThree();
  const portrait = size.width/size.height < .8;
  const source = useTexture('/ijane/chapel/pets-paper-v4.webp');
  const pets = useMemo(()=>{const t=source.clone();t.colorSpace=SRGBColorSpace;t.needsUpdate=true;return t;},[source]);
  const geometry = useMemo(()=>createChapelGeometry(),[]);
  useEffect(()=>()=>{geometry.dispose();pets.dispose();},[geometry,pets]);
  return <group name="ijane-origami-chapel">
    <mesh geometry={geometry} name="chapel-open-facade"><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
    <Pet type="cat" texture={pets} portrait={portrait}/><Pet type="dog" texture={pets} portrait={portrait}/>
    <mesh position={[portrait ? .65 : 1.02,-1.67,.52]} rotation={[.2,.4,0]}>
      <icosahedronGeometry args={[.08,0]}/><meshBasicMaterial color="#93b2c4" userData={keepColor}/>
    </mesh>
    <group position={[-1.08,-1.66,.63]} rotation={[0,.4,0]}>
      <mesh rotation={[0,0,-.55]}><coneGeometry args={[.07,.2,3]}/><meshBasicMaterial color="#d99674" userData={keepColor}/></mesh>
      <mesh position={[.05,.015,0]} rotation={[0,0,-1.1]}><coneGeometry args={[.055,.17,3]}/><meshBasicMaterial color="#edbda4" userData={keepColor}/></mesh>
    </group>
  </group>;
}
