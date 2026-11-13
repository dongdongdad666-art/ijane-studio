import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
import { Mesh, MeshBasicMaterial, Raycaster, Vector3, DoubleSide } from 'three';
import { createChapelGeometry, createDoorFaceGeometry, chapelLayout } from '../src/ijane/chapelGeometry.js';

test('facade keeps the original doorway open throughout the camera passage', () => {
  const geometry = createChapelGeometry();
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ side: DoubleSide }));
  mesh.updateMatrixWorld();
  for (const x of [-0.8, 0, 0.8]) {
    for (const y of [-1.5, -0.5, 0.5]) {
      const ray = new Raycaster(new Vector3(x, y, 5), new Vector3(0, 0, -1));
      assert.equal(ray.intersectObject(mesh).length, 0, `blocked at ${x}, ${y}`);
    }
  }
  assert.ok(new Raycaster(new Vector3(1.25, -0.5, 5), new Vector3(0, 0, -1)).intersectObject(mesh).length);
  assert.ok(new Raycaster(new Vector3(0, 1, 5), new Vector3(0, 0, -1)).intersectObject(mesh).length);
  geometry.dispose(); mesh.material.dispose();
});

test('new door faces fit existing hinges and meet at the center without a gap', () => {
  const left = createDoorFaceGeometry('left'), right = createDoorFaceGeometry('right');
  for (const geo of [left, right]) {
    geo.computeBoundingBox();
    assert.ok(Math.abs(geo.boundingBox.max.x - geo.boundingBox.min.x - 0.94) < 1e-6);
    assert.ok(Math.abs(geo.boundingBox.max.y - geo.boundingBox.min.y - 2.4) < 1e-6);
  }
  const lu = left.attributes.uv.array, ru = right.attributes.uv.array;
  assert.equal(lu[2], ru[0]);
  left.dispose(); right.dispose();
});

test('foreground cat is closer to the viewer than resting dog, clear of the path', () => {
  assert.ok(chapelLayout.cat.position[2] > chapelLayout.dog.position[2] + 0.8);
  assert.ok(chapelLayout.cat.position[0] < -0.94);
  assert.ok(chapelLayout.dog.position[0] > 0.94);
  assert.equal(chapelLayout.cat.position[1], -1.75);
  assert.equal(chapelLayout.dog.position[1], -1.75);
});

test('opaque dog silhouette stays in front of the architectural relief', async () => {
  const {data,info}=await sharp(fileURLToPath(new URL('../public-ijane/ijane/chapel/pets-paper-v4.webp',import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const geometry=createChapelGeometry();
  const material=new MeshBasicMaterial({side:DoubleSide});
  const facade=new Mesh(geometry,material);
  facade.updateMatrixWorld();
  const {position,size,uv}=chapelLayout.dog;
  const camera=new Vector3(0,.2,6);
  const blocked=[];
  for(let py=uv[1]+8;py<uv[3]-8;py+=12) for(let px=uv[0]+8;px<uv[2]-8;px+=12){
    if(data[(py*info.width+px)*4+3]<240)continue;
    const target=new Vector3(position[0]+((px-uv[0])/(uv[2]-uv[0])-.5)*size[0],position[1]+(1-(py-uv[1])/(uv[3]-uv[1]))*size[1],position[2]);
    const ray=new Raycaster(camera,target.clone().sub(camera).normalize(),0,camera.distanceTo(target)+.002);
    if(ray.intersectObject(facade).length)blocked.push([px,py]);
  }
  geometry.dispose();material.dispose();
  assert.equal(blocked.length,0,`architecture clips ${blocked.length} opaque dog samples, first: ${blocked[0]}`);
});
