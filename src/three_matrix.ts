import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, timer: THREE.Timer;
let meshes = new Map<string, THREE.Mesh>();   // id → mesh

// ====================== 2D MATRIX MATH ======================
type Matrix2D = [[number, number, number], [number, number, number], [number, number, number]];

const identity: Matrix2D = [[1,0,0],[0,1,0],[0,0,1]];

function translate(x: number, y: number): Matrix2D {
  return [[1, 0, x], [0, 1, y], [0, 0, 1]];
}

function rotate(angleDeg: number): Matrix2D {
  const rad = angleDeg * Math.PI / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
}

function scale(sx: number, sy: number): Matrix2D {
  return [[sx, 0, 0], [0, sy, 0], [0, 0, 1]];
}

function multiply(a: Matrix2D, b: Matrix2D): Matrix2D {
  const r: Matrix2D = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        r[i][j] += a[i][k] * b[k][j];
  return r;
}

function transformPoint(m: Matrix2D, x: number, y: number) {
  return {
    x: m[0][0]*x + m[0][1]*y + m[0][2],
    y: m[1][0]*x + m[1][1]*y + m[1][2]
  };
}

// ====================== ENTITIES LIST (Flat, like SpacetimeDB) ======================

interface Entity {
  id: string;
  parentId: string | null;
  position: { x: number; y: number };
  rotation: number;     // degrees
  scale: { x: number; y: number };
  // We will compute these:
  localMatrix?: Matrix2D;
  worldMatrix?: Matrix2D;
}

const entities: Entity[] = [
  {
    id: "parent1",
    parentId: null,
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 1, y: 1 }
  },
  {
    id: "child1",
    parentId: "parent1",
    position: { x: 1.5, y: 0 },
    rotation: 0,
    scale: { x: 0.6, y: 0.6 }
  },
  {
    id: "child2",
    parentId: "parent1",
    position: { x: -1.5, y: 0.8 },
    rotation: 45,
    scale: { x: 0.5, y: 0.5 }
  }
];

// ====================== THREE.JS SETUP ======================

init();

function init() {
  timer = new THREE.Timer();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create meshes for all entities
  entities.forEach(entity => {
    const size = entity.id.startsWith("parent") ? 2 : 1;
    const color = entity.id.startsWith("parent") ? 0x367ec2 : 0xff4444;

    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshes.set(entity.id, mesh);
  });

  renderer.setAnimationLoop(animate);
  window.addEventListener('resize', onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  timer.update();
  updateAllWorldTransforms();
  renderer.render(scene, camera);
}

// ====================== SERVER-SIDE HIERARCHY COMPUTATION ======================

function computeLocalMatrix(entity: Entity): Matrix2D {
  return multiply(
    translate(entity.position.x, entity.position.y),
    multiply(
      rotate(entity.rotation),
      scale(entity.scale.x, entity.scale.y)
    )
  );
}

function getWorldMatrix(entityId: string): Matrix2D {
  let currentId: string | null = entityId;
  let worldMat: Matrix2D = identity;

  while (currentId) {
    const entity = entities.find(e => e.id === currentId);
    if (!entity) break;

    const localMat = computeLocalMatrix(entity);
    worldMat = multiply(localMat, worldMat);   // Important: parent on left

    currentId = entity.parentId;
  }
  return worldMat;
}

function updateAllWorldTransforms() {
  entities.forEach(entity => {
    const mesh = meshes.get(entity.id);
    if (!mesh) return;

    // Compute full world matrix by walking up the hierarchy
    const worldMatrix = getWorldMatrix(entity.id);
    const worldPos = transformPoint(worldMatrix, 0, 0);

    // For rotation in 2D: we add angles up the chain (simple approximation)
    let worldRotation = 0;
    let currentId: string | null = entity.id;
    while (currentId) {
      const e = entities.find(en => en.id === currentId);
      if (!e) break;
      worldRotation += e.rotation;
      currentId = e.parentId;
    }

    // Apply to mesh
    mesh.position.set(worldPos.x, worldPos.y, 0);
    mesh.rotation.z = (worldRotation * Math.PI) / 180;
    mesh.scale.set(
      entity.scale.x * (getParentScaleFactor(entity.id) || 1),
      entity.scale.y * (getParentScaleFactor(entity.id) || 1),
      1
    );
  });
}

// Simple helper to multiply scale up the chain (approximation)
function getParentScaleFactor(entityId: string): number {
  let sx = 1, sy = 1;
  let currentId: string | null = entityId;
  while (currentId) {
    const e = entities.find(en => en.id === currentId);
    if (!e) break;
    sx *= e.scale.x;
    sy *= e.scale.y;
    currentId = e.parentId;
  }
  return Math.sqrt(sx * sy); // rough average for uniform feel
}

// ====================== TWEAKPANE UI ======================

const pane = new Pane({ title: "Hierarchy Test" });

entities.forEach(entity => {
  const folder = pane.addFolder({ title: `${entity.id} ${entity.parentId ? '(Child)' : '(Parent)'}` });

  folder.addBinding(entity.position, 'x', { min: -6, max: 6, step: 0.01 }).on('change', () => {});
  folder.addBinding(entity.position, 'y', { min: -6, max: 6, step: 0.01 }).on('change', () => {});
  folder.addBinding(entity, 'rotation', { min: -180, max: 180, step: 1 }).on('change', () => {});
  folder.addBinding(entity.scale, 'x', { min: 0.2, max: 3, step: 0.01 }).on('change', () => {});
  folder.addBinding(entity.scale, 'y', { min: 0.2, max: 3, step: 0.01 }).on('change', () => {});
});