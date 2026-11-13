import { BufferGeometry, Float32BufferAttribute, PlaneGeometry } from 'three';

// The illustration is camera-projected onto a shallow architectural relief and
// a horizontal courtyard. All distances are in the original entrance's units.
const W = 1536, H = 1024;
const door = { left: 571, right: 960, top: 446, bottom: 862 };
const doorMiddle = (door.left + door.right) / 2;
const sx = 1.88 / (door.right - door.left);
const sy = 2.4 / (door.bottom - door.top);
const cameraY = 0.2, cameraZ = 6, floorY = -1.75;
export const chapelArtwork = {width: W, height: H};
export const chapelFraming = {
  // Cover the artwork bounds, including the shorter lower margin. This keeps
  // clamped texture borders outside the entry view on every aspect ratio.
  height: 2 * (cameraY - floorY + (H - door.bottom) * sy) * .99,
  width: 2 * Math.min(doorMiddle, W - doorMiddle) * sx * 1.2 * .99,
};

// The loader's flat drawing uses the same projection as the entry relief.
export function getChapelScreenTransform(width, height) {
  const aspect=width/height;
  const worldHeight=Math.min(chapelFraming.height,chapelFraming.width/aspect);
  const focal=cameraZ*height/worldHeight;
  const scaleX=aspect<.8?1:1.2;
  // useInfiniteCamera looks from y=.2 toward y=.13 ten units ahead.
  // Projective CSS keeps this tiny pitch, including its varying scale with y.
  const pitch=Math.atan((.2-.13)/10),c=Math.cos(pitch),s=Math.sin(pitch);
  const y0=floorY+door.bottom*sy-cameraY;
  const depth=cameraZ*c-s*y0;
  return [
    focal*sx*scaleX/depth,0,0,0,
    width/2*s*sy/depth,(height/2*s*sy+focal*c*sy)/depth,0,s*sy/depth,
    0,0,1,0,
    width/2-focal*sx*scaleX*doorMiddle/depth,height/2-focal*(c*y0+cameraZ*s)/depth,0,1,
  ];
}

export const chapelLayout = {
  cat: { position: [-1.4, floorY, 1.5], size: [0.70, 1.16], uv: [101, 101, 568, 874] },
  // Leave clearance between the tail and the right-hand plinth relief.
  dog: { position: [1.38, floorY, 0.32], size: [1.14, 0.45], uv: [700, 426, 1484, 738] },
};

function project(px, py, z) {
  const t = (cameraZ - z) / cameraZ;
  return [(px - doorMiddle) * sx * t, cameraY + (floorY + (door.bottom - py) * sy - cameraY) * t, z];
}

function point(px, py) {
  // Paper roof folds: shallow physical depth; reduce relief at the door jamb.
  const away = Math.min(1, Math.max(0, (Math.abs(px - 768) - 195) / 170));
  let z = away * (0.12 + 0.22 * Math.abs(Math.sin((px - 768) / 170)));
  if (py > door.bottom) {
    const planeY = floorY + (door.bottom - py) * sy;
    const t = (floorY - cameraY) / (planeY - cameraY);
    z = cameraZ * (1 - t);
  }
  // Relief around the illustrated side plinths and bench gives forward motion
  // actual parallax while keeping all original contour/texture detail.
  const bench = px < 365 && py > 810 && py < 940;
  const leftPlant = px < 300 && py > 470 && py < 860;
  const rightObjects = px > 1210 && py > 430 && py < 920;
  if (bench) z = Math.max(z, 0.7);
  if (leftPlant || rightObjects) z = Math.max(z, 0.32);
  return project(px, py, z);
}

export function createChapelGeometry() {
  // Extra perimeter covers ultrawide/portrait viewports with the border folds,
  // rather than exposing an empty background beyond a rectangular image plane.
  const xs = [...new Set([-1100, ...Array.from({length: 97}, (_, i) => i * W / 96), door.left, door.right, 2636])].sort((a,b)=>a-b);
  const ys = [...new Set([-500, ...Array.from({length: 65}, (_, i) => i * H / 64), door.top, door.bottom, 1700])].sort((a,b)=>a-b);
  const positions = [], uvs = [], indices = [];
  for (const y of ys) for (const x of xs) {
    positions.push(...point(x,y));
    uvs.push(Math.max(0,Math.min(1,x/W)),1-Math.max(0,Math.min(1,y/H)));
  }
  for (let j=0;j<ys.length-1;j++) for(let i=0;i<xs.length-1;i++) {
    const cx=(xs[i]+xs[i+1])/2,cy=(ys[j]+ys[j+1])/2;
    if(cx>door.left&&cx<door.right&&cy>door.top&&cy<door.bottom)continue;
    const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;
    indices.push(a,c,b,b,c,d);
  }
  const g=new BufferGeometry();
  g.setAttribute('position',new Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();
  return g;
}

export function createDoorFaceGeometry(side) {
  const g=new PlaneGeometry(.94,2.4);
  const x0=side==='left'?door.left:doorMiddle,x1=side==='left'?doorMiddle:door.right;
  g.setAttribute('uv',new Float32BufferAttribute([x0/W,1-door.top/H,x1/W,1-door.top/H,x0/W,1-door.bottom/H,x1/W,1-door.bottom/H],2));
  return g;
}

export function createPetGeometry(size, rect) {
  const [x0,y0,x1,y1]=rect;
  const g=new PlaneGeometry(...size);
  g.translate(0,size[1]/2,0);
  g.setAttribute('uv',new Float32BufferAttribute([x0/W,1-y0/H,x1/W,1-y0/H,x0/W,1-y1/H,x1/W,1-y1/H],2));
  return g;
}
