import { Color } from 'three';

export const workshop = {
  paper: '#F3EDE2', blue: '#B9CEDB', ink: '#344653', orange: '#D76B4A',
  wood: '#DCC6A7', sea: '#A5C6C8', cloud: '#FAF3E6',
};

export const roomSkies = {
  corridor: '#F3EDE2', gallery: '#DCE9EA', studio: '#E0E8E9',
  about: '#C6DEE6', contact: '#D6E6E4',
};

// Map source paths, not screen pixels: actual project covers never enter this pipeline.
export function paletteForTexture(path = '') {
  const source = path.toLowerCase();
  if (!source || source.startsWith('data:')) return null;
  if (source.includes('/ijane/') && !source.includes('/ijane/about-')) return null;
  if (!source.includes('/textures/') && !source.includes('/ijane/about-')) return null;
  if (/faletopdown/.test(source)) return { paper: workshop.sea, ink: '#567F87' };
  if (/latarnia/.test(source)) return { paper: '#E6AD8B', ink: workshop.ink };
  if (/cloud|chmur/.test(source)) return { paper: workshop.cloud, ink: '#839BA5' };
  if (/door_(left|right)|drzwi/.test(source)) return { paper: workshop.blue, ink: workshop.ink };
  if (/molo|beczka|belka|kawalekpodlogi|stone-path|gallery\/floor/.test(source)) return { paper: workshop.wood, ink: '#697068' };
  if (/tree|pot_with/.test(source)) return { paper: '#CCD3BB', ink: '#627879' };
  if (/studio\//.test(source)) return { paper: workshop.blue, ink: '#536D7D' };
  if (/domki|miastotlo|railing/.test(source)) return { paper: '#D2DFDF', ink: '#6A838A' };
  if (/przycisk|button/.test(source)) return { paper: '#EAC3A7', ink: workshop.ink };
  return { paper: workshop.paper, ink: workshop.ink };
}

// Run before lighting/fog and preserve all alpha/discard logic from the original shader.
// Colors are linear-space uniforms; Three performs the final output conversion once.
export function injectWorkshopPalette(shader, palette) {
  shader.uniforms.ijanePaper = { value: new Color(palette.paper) };
  shader.uniforms.ijaneInk = { value: new Color(palette.ink) };
  shader.fragmentShader = 'uniform vec3 ijanePaper;\nuniform vec3 ijaneInk;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
    float ijaneBase = max(dot(diffuse, vec3(0.2126, 0.7152, 0.0722)), 0.001);
    float ijaneTone = clamp(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) / ijaneBase, 0.0, 1.0);
    diffuseColor.rgb = mix(ijaneInk, ijanePaper, ijaneTone);
    #include <color_fragment>
  `);
}

export function applyWorkshopMaterial(material, palette) {
  if (!material || !palette || (!material.isMeshBasicMaterial && !material.isMeshStandardMaterial)) return false;
  const previous = material.userData.ijanePalette;
  if (previous && material.onBeforeCompile === previous.wrapper) return false;
  const originalCompile = material.onBeforeCompile;
  const baseKey = previous?.baseKey ?? material.customProgramCacheKey();
  const wrapper = function(shader, renderer) {
    originalCompile.call(this, shader, renderer);
    injectWorkshopPalette(shader, palette);
  };
  material.onBeforeCompile = wrapper;
  material.customProgramCacheKey = () => `${baseKey}|ijane-cream-blue-v1`;
  material.userData.ijanePalette = { wrapper, baseKey };
  material.needsUpdate = true;
  return true;
}
