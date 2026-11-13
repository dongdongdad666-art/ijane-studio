import test from 'node:test';
import assert from 'node:assert/strict';
import { MeshBasicMaterial, ShaderLib } from 'three';
import { applyWorkshopMaterial, paletteForTexture, workshop } from '../src/ijane/workshopPalette.js';

test('project covers are excluded while cloned environment texture paths are classified', () => {
  assert.equal(paletteForTexture('http://localhost/ijane/phase-origin.webp'), null);
  assert.equal(paletteForTexture('http://localhost/ijane/shunlu.webp'), null);
  assert.equal(paletteForTexture('data:image/gif;base64,dummy'), null);
  assert.equal(paletteForTexture(''), null);
  assert.equal(paletteForTexture('http://localhost/textures/contact/faletopdown.webp').paper, workshop.sea);
  assert.equal(paletteForTexture('/textures/doors/door_right_painted.webp').paper, workshop.blue);
});

test('palette composes with original reveal uniforms/discard and preserves the alpha and fog stages', () => {
  const material = new MeshBasicMaterial();
  const progress = { value: .5 };
  material.onBeforeCompile = shader => {
    shader.uniforms.originalProgress = progress;
    shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\nif (false) discard;');
  };
  assert.equal(applyWorkshopMaterial(material, { paper: workshop.blue, ink: workshop.ink }), true);
  const shader = { fragmentShader: ShaderLib.basic.fragmentShader, uniforms: {} };
  material.onBeforeCompile(shader);
  assert.equal(shader.uniforms.originalProgress, progress);
  assert.ok(shader.fragmentShader.includes('if (false) discard;'));
  assert.ok(shader.fragmentShader.includes('#include <fog_fragment>'));
  assert.ok(shader.fragmentShader.includes('#include <opaque_fragment>'));
  assert.ok(!shader.fragmentShader.includes('diffuseColor.a ='));
  assert.ok(shader.fragmentShader.indexOf('diffuseColor.rgb = mix') < shader.fragmentShader.indexOf('#include <fog_fragment>'));
  const version = material.version;
  assert.equal(applyWorkshopMaterial(material, { paper: workshop.blue, ink: workshop.ink }), false);
  assert.equal(material.version, version);
  assert.ok(material.customProgramCacheKey().endsWith('ijane-cream-blue-v1'));
});
