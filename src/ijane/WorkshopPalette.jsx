import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color } from 'three';
import { useScene } from '../context/SceneContext.jsx';
import { applyWorkshopMaterial, paletteForTexture, roomSkies, workshop } from './workshopPalette.js';

export default function WorkshopPalette() {
  const { currentRoom } = useScene();
  const sky = useMemo(() => new Color(roomSkies[currentRoom] || roomSkies.corridor), [currentRoom]);
  useFrame(({ scene }, delta) => {
    const easing = 1 - Math.exp(-delta * 3);
    if (scene.background?.isColor) scene.background.lerp(sky, easing);
    if (scene.fog) scene.fog.color.copy(scene.background);
    // A small material adapter also catches streamed corridor segments and lazy room mounts.
    // Already adapted materials exit immediately; this never creates new textures or materials.
    scene.traverse(object => {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material || material.map?.isCanvasTexture) continue;
        if (material.userData.ijanePalette?.wrapper === material.onBeforeCompile) continue;
        if (material.map) {
          const image = material.map.image;
          const path = image?.currentSrc || image?.src || '';
          applyWorkshopMaterial(material, paletteForTexture(path));
        } else if (material.color && !material.userData.ijanePlainColor) {
          // Text, outline geometry and untextured paper retain their silhouettes.
          const { r, g, b } = material.color;
          const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 0.045;
          if (neutral) material.color.set(r < 0.35 ? workshop.ink : workshop.paper);
          material.userData.ijanePlainColor = true;
        }
      }
    });
  });
  return null;
}
