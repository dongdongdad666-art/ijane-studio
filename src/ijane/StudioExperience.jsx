import { Component, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Edges, Html } from '@react-three/drei';
import * as THREE from 'three';

// Original code-native set for IJane. The upstream MIT license remains at the
// repository root; no upstream personal textures, models or audio are loaded.
const PAPER = '#f4f0e7';
const INK = '#6e6b64';
const BLUE = '#4866a8';
const IDS = ['phase-origin', 'shunlu', 'belite', 'otherspace'];
const VIEWS = {
  gallery: { eye: [2.4, 5.8, 15], target: [0, 2.35, 0], span: 20 },
  process: { eye: [6, 7.5, 10], target: [1.6, 1.1, 2], span: 10 },
  about: { eye: [-3.5, 7, 9], target: [0.4, 1.2, 2], span: 8.8 },
  contact: { eye: [5.2, 5.6, 10], target: [2.9, 1.25, 2], span: 8.5 },
};

function Stroke({ points, color = INK, opacity = 0.7, ...props }) {
  const vertices = useMemo(() => new Float32Array(points.flat()), [points]);
  return <line {...props}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[vertices, 3]} /></bufferGeometry>
    <lineBasicMaterial color={color} transparent opacity={opacity} />
  </line>;
}

function PaperBox({ size, color = PAPER, outline = true, ...props }) {
  return <mesh castShadow receiveShadow {...props}>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={0.94} />
    {outline && <Edges threshold={25} color={INK} transparent opacity={0.5} />}
  </mesh>;
}

function Rod({ from, to, radius = 0.025, color = INK }) {
  const { center, rotation, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    return {
      center: a.clone().add(b).multiplyScalar(0.5),
      rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    };
  }, [from, to]);
  return <mesh position={center} quaternion={rotation} castShadow>
    <cylinderGeometry args={[radius, radius, length, 7]} />
    <meshStandardMaterial color={color} roughness={0.85} />
  </mesh>;
}

function PaperSurface({ width, height, bend = 0.1, color = PAPER, ...props }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, 14, 20);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, bend * (x * x + 0.13 * Math.sin(y * 3)));
    }
    g.computeVertexNormals();
    return g;
  }, [width, height, bend]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow {...props}>
    <meshStandardMaterial color={color} roughness={0.98} side={THREE.DoubleSide} />
  </mesh>;
}

function DraftingWall() {
  const lines = useMemo(() => {
    const result = [];
    for (let x = -6.7; x < 6.8; x += 0.65) result.push([[x, 0.1, -3.03], [x + 0.012, 5.6, -3.03]]);
    for (let y = 0.1; y < 5.7; y += 0.65) result.push([[-6.7, y, -3.03], [6.7, y + 0.006, -3.03]]);
    return result;
  }, []);
  const circle = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const a = i / 89 * Math.PI * 2;
    return [Math.cos(a) * 2.05 - 1.9, Math.sin(a) * 2.05 + 2.85, -3.01];
  }), []);
  return <group>
    <PaperBox size={[13.8, 5.7, 0.075]} position={[0, 2.85, -3.12]} color="#e3e8f1" />
    {lines.map((points, i) => <Stroke key={i} points={points} color="#a6b4ce" opacity={0.4} />)}
    <Stroke points={circle} color="#8297bc" opacity={0.5} />
    <Stroke points={[[-6.6, 0.3, -3.0], [5.4, 5.6, -3.0]]} color="#8297bc" opacity={0.45} />
    <Stroke points={[[-4.2, 0.3, -3], [-4.2, 5.4, -3]]} color="#8297bc" opacity={0.5} />
    <Stroke points={[[-6.5, 2.85, -3], [1, 2.85, -3]]} color="#8297bc" opacity={0.5} />
  </group>;
}

function Architecture() {
  const arch = useMemo(() => Array.from({ length: 65 }, (_, i) => {
    const x = -7.25 + i / 64 * 14.5;
    return [x, 4.75 + 1.5 * (1 - (x / 7.25) ** 2), 0];
  }), []);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(arch.map(p => new THREE.Vector3(...p))), [arch]);
  return <group>
    <PaperBox size={[17, 0.12, 10]} position={[0, -0.12, 0]} color="#f0ede5" />
    <DraftingWall />
    {[-7.25, 7.25].map(x => <group key={x}>
      <PaperBox size={[0.13, 4.9, 0.16]} position={[x, 2.4, -2.8]} />
      <PaperBox size={[0.16, 4.9, 0.16]} position={[x, 2.4, 2.8]} />
      {[0.5, 3.7].map(y => <PaperBox key={y} size={[0.2, 0.2, 0.19]} position={[x, y, 2.8]} color={BLUE} />)}
      <Rod from={[x, 4.75, -2.8]} to={[x, 4.75, 2.8]} radius={0.045} color="#b9b3a6" />
    </group>)}
    {[-2.8, 2.8].map(z => <group position={[0, 0, z]} key={z}>
      <mesh><tubeGeometry args={[curve, 64, 0.075, 5, false]} /><meshStandardMaterial color={PAPER} roughness={0.95} /><Edges color={INK} threshold={24} /></mesh>
      <Stroke points={arch.map(([x, y]) => [x, y + 0.07, 0.08])} opacity={0.45} />
    </group>)}
    {/* A narrow suspended sheet catches the light, leaving the room open. */}
    <PaperSurface width={9.2} height={0.8} bend={0.026} position={[0, 5.7, -0.5]} rotation={[-Math.PI / 2, 0.08, -0.035]} />
    {Array.from({ length: 12 }, (_, i) => <Stroke key={i} points={[[-8, 0.002, -4.5 + i * 0.82], [8, 0.002, -4.49 + i * 0.82]]} opacity={0.09} />)}
    {[-6.6, -2.7, 1.2, 5.1].map(x => <Stroke key={x} points={[[x, 0.003, -5], [x + 0.02, 0.003, 5]]} opacity={0.12} />)}
  </group>;
}

function CoverImage({ src, width, height }) {
  const [loaded, setLoaded] = useState(null);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    if (!src) return undefined;
    let alive = true;
    const texture = new THREE.TextureLoader().load(src, value => {
      if (!alive) { value.dispose(); return; }
      value.colorSpace = THREE.SRGBColorSpace;
      value.anisotropy = 4;
      setLoaded({ texture: value, src });
      invalidate();
    }, undefined, () => invalidate());
    return () => { alive = false; texture.dispose(); };
  }, [src, invalidate]);
  if (!loaded || loaded.src !== src) return null;
  const aspect = loaded.texture.image.width / loaded.texture.image.height;
  const w = Math.min(width, height * aspect);
  const h = Math.min(height, width / aspect);
  return <mesh position={[0, 0.035, 0.101]}>
    <planeGeometry args={[w, h]} />
    <meshBasicMaterial map={loaded.texture} toneMapped={false} />
  </mesh>;
}

function Exhibition({ project, index, onNavigate, reducedMotion }) {
  const [hovered, setHovered] = useState(false);
  const compact = useThree(state => state.size.width < 900);
  const group = useRef();
  const x = (index - 1.5) * 3.25;
  useFrame((_, delta) => {
    if (!group.current) return;
    const goal = hovered ? -1.94 : -2.12;
    group.current.position.z = reducedMotion ? goal : THREE.MathUtils.damp(group.current.position.z, goal, 7, delta);
  });
  const activate = () => project && onNavigate?.(`/works/${project.id}`);
  return <group ref={group} position={[x, 2.35, -2.12]} rotation={[0, index === 0 ? 0.018 : -0.012, (index % 2 ? -1 : 1) * 0.008]}>
    <group onPointerOver={e => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)} onClick={e => { e.stopPropagation(); activate(); }}>
      <PaperBox size={[2.9, 2.8, 0.12]} color={hovered ? '#fffdf5' : '#f6f2e8'} />
      <PaperBox size={[2.67, 2.12, 0.025]} position={[0, 0.12, 0.08]} color="#e7e4dc" />
      <CoverImage src={project?.cover?.src} width={2.59} height={2.04} />
      <Stroke points={[[-1.48, -1.42, 0.09], [-1.46, 1.43, 0.09], [1.43, 1.41, 0.09]]} opacity={0.5} />
      <Stroke points={[[-1.42, -1.46, 0.1], [1.48, -1.44, 0.1], [1.46, 1.38, 0.1]]} opacity={0.32} />
      {[-1.27, 1.27].map(side => <group key={side}>
        <PaperBox size={[0.16, 0.75, 0.3]} position={[side, -1.78, 0]} rotation={[0.08, 0, side * -0.045]} />
        <PaperBox size={[0.13, 0.15, 0.03]} position={[side, -1.3, 0.1]} color={hovered ? '#718bc0' : BLUE} />
        <Rod from={[side, 1.4, -0.04]} to={[side, 3.1, -0.04]} radius={0.009} color="#a3a39a" />
      </group>)}
      <mesh position={[-1.1, 1.48, 0.075]}><planeGeometry args={[0.46, 0.32]} /><meshBasicMaterial color={PAPER} /></mesh>
    </group>
    <Html position={[0, -1.15, 0.2]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'auto' }}>
      <button type="button" onClick={activate} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} aria-label={`查看${project?.title || IDS[index]}案例`} style={{ border: 0, borderBottom: `1px solid ${hovered ? BLUE : 'transparent'}`, background: 'transparent', color: hovered ? BLUE : '#403e37', fontFamily: 'Georgia, "Microsoft YaHei", serif', fontSize: 12, whiteSpace: 'nowrap', minHeight: 44, padding: '0 7px', cursor: 'pointer' }}>
        <span style={{ fontStyle: 'italic', marginRight: compact ? 0 : 9 }}>{String(index + 1).padStart(2, '0')}</span>{!compact && ['相原','顺路面包','Belite','OTHERSPACE'][index]}<span aria-hidden="true" style={{ marginLeft: 10 }}>↗</span>
      </button>
    </Html>
  </group>;
}

function Notebook({ about = false, onNavigate }) {
  const sketch = useMemo(() => Array.from({ length: 45 }, (_, i) => {
    const t = i / 44 * Math.PI * 2;
    return [-0.54 + Math.cos(t) * 0.3, 0.115, Math.sin(t) * 0.48];
  }), []);
  return <group position={[-0.65, 1.39, 2.15]} rotation={[0, -0.13, 0]}>
    <PaperBox size={[2.2, 0.075, 1.55]} color="#bdb7a9" />
    {[-1, 1].map(side => <group key={side} position={[side * 0.54, 0.055, 0]} rotation={[0, 0, side * 0.055]}>
      <PaperSurface width={1.07} height={1.5} bend={0.09} rotation={[-Math.PI / 2, 0, 0]} />
      {Array.from({ length: 6 }, (_, i) => <Stroke key={i} points={[[-0.4, 0.04, -0.53 + i * 0.19], [0.39 - (i % 3) * 0.09, 0.041, -0.52 + i * 0.19]]} opacity={0.3} />)}
      <Stroke points={[[-0.39, 0.05, -0.5], [-0.37, 0.05, 0.53], [0.38, 0.05, 0.55], [0.4, 0.05, -0.51], [-0.39, 0.05, -0.5]]} opacity={0.45} />
    </group>)}
    <Stroke points={[[0, 0.12, -0.73], [0.015, 0.12, 0.73]]} opacity={0.7} />
    <Stroke points={sketch} color={BLUE} opacity={0.65} />
    <Stroke points={[[-0.85, 0.12, 0.38], [-0.51, 0.12, -0.37], [-0.26, 0.12, 0.13], [-0.85, 0.12, 0.38]]} color={BLUE} opacity={0.5} />
    {[-0.39, 0.29].map(z => <Stroke key={z} points={[[0.17, 0.12, z - 0.19], [0.9, 0.12, z - 0.19], [0.88, 0.12, z + 0.22], [0.16, 0.12, z + 0.2], [0.17, 0.12, z - 0.19]]} color={BLUE} opacity={0.65} />)}
    {about && <Html center position={[0, 0.15, 0]} zIndexRange={[9, 0]}><button className="prop-link" onClick={()=>onNavigate('/about')}>翻开栀远的故事 ↗</button></Html>}
  </group>;
}

function Leaf({ height, width, rotation, position }) {
  const { geometry, outline, spine, veins } = useMemo(() => {
    const verts = [], indices = [], left = [], right = [], mid = [], ribs = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const y = t * height;
      const w = Math.sin(Math.PI * t) ** 0.8 * width;
      const z = Math.sin(t * Math.PI) * 0.22 + t * t * 0.25;
      const l = [-w, y, z], c = [0, y, z + 0.09 * Math.sin(t * Math.PI)], r = [w, y, z];
      verts.push(...l, ...c, ...r); left.push(l); right.push(r); mid.push(c);
      if (i > 0) { const n = i * 3; indices.push(n - 3, n, n - 2, n - 2, n, n + 1, n - 2, n + 1, n - 1, n - 1, n + 1, n + 2); }
      if (i > 3 && i < 23 && i % 4 === 0) ribs.push([l, [0, y - 0.13, z + 0.07], r]);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(indices); g.computeVertexNormals();
    return { geometry: g, outline: [...left, ...right.reverse()], spine: mid, veins: ribs };
  }, [height, width]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group position={position} rotation={rotation}>
    <mesh geometry={geometry}><meshStandardMaterial color="#b8b9f2" emissive="#7586cb" emissiveIntensity={0.22} transparent opacity={0.61} roughness={0.4} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <Stroke points={outline} color="#8994c6" opacity={0.85} />
    <Stroke points={spine} color="#8994c6" opacity={0.9} />
    {veins.map((v, i) => <Stroke key={i} points={v} color="#8994c6" opacity={0.5} />)}
  </group>;
}

function PrototypePlant({ reducedMotion }) {
  const leaves = useRef();
  useFrame(({ clock }) => { if (leaves.current && !reducedMotion) leaves.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.065; });
  return <group position={[4.1, 1.41, 1.75]}>
    <mesh receiveShadow><cylinderGeometry args={[0.46, 0.5, 0.09, 40]} /><meshStandardMaterial color="#b8c2dd" roughness={0.7} /><Edges color="#8d9bbd" /></mesh>
    <group ref={leaves}>
      <Leaf position={[0, 0.08, 0]} rotation={[0.1, 0.1, -0.43]} height={1.95} width={0.34} />
      <Leaf position={[0.06, 0.08, 0]} rotation={[-0.2, 0.4, 0.6]} height={1.6} width={0.4} />
      <Leaf position={[-0.06, 0.08, 0.04]} rotation={[0.15, -0.45, 0.08]} height={2.1} width={0.31} />
    </group>
  </group>;
}

function Worktable({ room, reducedMotion, onNavigate }) {
  return <group>
    <PaperBox size={[7.8, 0.15, 2.3]} position={[1.5, 1.25, 2]} />
    {[-1.8, 4.8].map(x => <group key={x}>
      { [1.25, 2.75].map(z => <group key={z}>
        <PaperBox size={[0.12, 1.25, 0.12]} position={[x, 0.6, z]} rotation={[0, 0, x < 0 ? -0.08 : 0.08]} />
        <PaperBox size={[0.17, 0.18, 0.16]} position={[x, 1.05, z]} color={BLUE} />
      </group>)}
      <Rod from={[x, 0.25, 1.2]} to={[x, 1.13, 2.8]} radius={0.019} color="#b5b1a6" />
    </group>)}
    <Rod from={[-1.8, 0.38, 2.6]} to={[4.8, 0.38, 2.6]} radius={0.028} color="#b5b1a6" />
    <Notebook about={room === 'about'} onNavigate={onNavigate}/>
    {room==='process'&&<Html center position={[1.85,1.6,2.2]} zIndexRange={[9,0]}><button className="prop-link" onClick={()=>onNavigate('/process')}>打开制作笔记 ↗</button></Html>}
    <group visible={room !== 'contact'} position={[1.85, 1.39, 2.2]} rotation={[0, -0.15, 0]}>
      <PaperBox size={[1.65, 0.06, 1.18]} />
      {['#c8b99b', '#e8dfc9', '#aeb8b0', '#c1c7dc'].map((c, i) => <PaperBox key={c} size={[0.59, 0.065, 0.4]} position={[(i % 2 - 0.5) * 0.71, 0.08, (Math.floor(i / 2) - 0.5) * 0.51]} color={c} rotation={[0, i * 0.025, 0]} />)}
    </group>
    <PrototypePlant reducedMotion={reducedMotion} />
    <group position={[5.0, 1.35, 1.2]}>
      <mesh><cylinderGeometry args={[0.26, 0.29, 0.075, 24]} /><meshStandardMaterial color="#ddd7c9" roughness={0.8} /><Edges color={INK} /></mesh>
      <Rod from={[0, 0.06, 0]} to={[0.16, 1.06, 0]} radius={0.024} color="#a49b86" />
      <Rod from={[0.16, 1.06, 0]} to={[-0.37, 1.7, 0]} radius={0.024} color="#a49b86" />
      <mesh position={[-0.42, 1.66, 0]} rotation={[0, 0, -0.4]}><coneGeometry args={[0.29, 0.35, 24, 1, true]} /><meshStandardMaterial color="#e5d4b7" roughness={0.8} side={THREE.DoubleSide} /><Edges color={INK} /></mesh>
      <mesh position={[-0.46, 1.51, 0]}><sphereGeometry args={[0.075, 10, 8]} /><meshBasicMaterial color="#ffdeb0" /></mesh>
    </group>
    {room === 'contact' && <group position={[2.3, 1.45, 2.1]} rotation={[-Math.PI / 2, 0, -0.06]}>
      <PaperSurface width={1.85} height={1.05} bend={0.06} />
      <Html position={[0, 0, 0.05]} center zIndexRange={[9, 0]}><button className="prop-link" onClick={()=>onNavigate('/contact')}>IJane · 下一段创作 ↗</button></Html>
    </group>}
    <group visible={room === 'about'} position={[1.7, 1.4, 1.75]}>
      {[-0.4, 0.45].map((x, i) => <PaperBox key={x} size={[0.72, 0.025, 1.05]} position={[x, 0.02 + i * 0.03, 0]} rotation={[0, x * 0.3, 0]} color={i ? '#e3e8f1' : PAPER} />)}
    </group>
    <Rod from={[3, 1.38, 2.75]} to={[3.8, 1.39, 2.9]} radius={0.025} color={BLUE} />
    {/* A folded task note, a studio prop rather than evidence of a project. */}
    <PaperSurface width={0.65} height={0.45} position={[-1.9, 1.5, 1.7]} rotation={[-0.35, 0.12, -0.05]} bend={0.1} />
  </group>;
}

function CameraRig({ room, reducedMotion }) {
  const { camera, size, invalidate } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.75, 0));
  const desiredEye = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { invalidate(); }, [room, reducedMotion, size, invalidate]);
  useFrame(({ pointer }, delta) => {
    const view = VIEWS[room] || VIEWS.gallery;
    desiredEye.set(view.eye[0] + (reducedMotion ? 0 : pointer.x * 0.14), view.eye[1] + (reducedMotion ? 0 : pointer.y * 0.08), view.eye[2]);
    desiredTarget.set(...view.target);
    const zoom = Math.min(size.width / view.span, size.height / (room === 'gallery' ? 8.5 : 6.2));
    const alpha = reducedMotion ? 1 : 1 - Math.exp(-4.2 * Math.min(delta, 0.1));
    camera.position.lerp(desiredEye, alpha);
    target.current.lerp(desiredTarget, alpha);
    // R3F owns a mutable Three.js camera; mutations here are the render-loop API.
    // eslint-disable-next-line react-hooks/immutability
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, alpha);
    camera.lookAt(target.current);
    camera.updateProjectionMatrix();
  });
  return null;
}

function ContextHealth({ onError }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const fail = event => { event.preventDefault(); onError?.(new Error('WebGL context lost')); };
    canvas.addEventListener('webglcontextlost', fail);
    return () => canvas.removeEventListener('webglcontextlost', fail);
  }, [gl, onError]);
  return null;
}

function Scene({ projects, room, reducedMotion, onNavigate, onError }) {
  const featured = IDS.map(id => projects.find(project => project.id === id));
  return <>
    <color attach="background" args={['#f4f1e9']} />
    <ambientLight intensity={1.5} />
    <hemisphereLight args={['#f9fbff', '#d5cbbb', 1.2]} />
    <directionalLight position={[-5, 10, 8]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-11} shadow-camera-right={11} shadow-camera-top={10} shadow-camera-bottom={-8} shadow-normalBias={0.035} shadow-bias={-0.00015} />
    <CameraRig room={room} reducedMotion={reducedMotion} />
    <ContextHealth onError={onError} />
    <Architecture />
    {room === 'gallery' && <group>{featured.map((project, index) => <Exhibition key={IDS[index]} project={project} index={index} onNavigate={onNavigate} reducedMotion={reducedMotion} />)}</group>}
    <Worktable room={room} reducedMotion={reducedMotion} onNavigate={onNavigate}/>
  </>;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { this.props.onError?.(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function StudioExperience({ projects = [], room = 'gallery', reducedMotion = false, onNavigate, onError, onReady }) {
  return <SceneBoundary onError={onError}>
    <Canvas orthographic shadows dpr={[1, 1.7]} frameloop={reducedMotion ? 'demand' : 'always'} camera={{ position: [2.4, 5.3, 15], zoom: 50, near: 0.1, far: 80 }} gl={{ antialias: true, alpha: false, powerPreference: 'low-power' }} onCreated={onReady} fallback={<span>手绘创作工作室，可通过页面文字入口浏览相同作品。</span>} style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}>
      <Scene projects={projects} room={room} reducedMotion={reducedMotion} onNavigate={onNavigate} onError={onError} />
    </Canvas>
  </SceneBoundary>;
}
