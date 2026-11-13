import { forwardRef } from 'react';

// Fixed Chinese lettering avoids platform font fallback while retaining the paper animation.
const GalleryCopyLabel = forwardRef(function GalleryCopyLabel({ copy, texture, position, top = false, opacity = 0 }, ref) {
  const y = position[1] - (top ? copy.height / 2 : 0);
  return <mesh ref={ref} name={`gallery-copy-${copy.id}`} userData={{ text: copy.text }} position={[position[0], y, position[2]]}>
    <planeGeometry args={[copy.width, copy.height]} />
    <meshBasicMaterial map={texture} color="#344653" transparent depthWrite={false} opacity={opacity} />
  </mesh>;
});
export default GalleryCopyLabel;
