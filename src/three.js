import * as THREE from 'three';

let camera, scene, mesh, renderer, timer;

const moveSpeed = 5; // units per second (adjust as needed)

// Track which keys are currently pressed
const keys = {
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

init();

async function init() {
  timer = new THREE.Timer();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.setAnimationLoop( animate );
  window.addEventListener( 'resize', onWindowResize );
  const geometry = new THREE.PlaneGeometry( 1, 1 );
  const material = new THREE.MeshBasicMaterial({
    // color: 0x00ff00 //green
    color: 0x367ec2 //green
  });
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // scene.add( cube );

  // Keyboard listeners
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function upate_input(delta){
  // Calculate movement direction
  let moveX = 0;
  let moveY = 0;

  if (keys.KeyA || keys.ArrowLeft)  moveX -= 1;
  if (keys.KeyD || keys.ArrowRight) moveX += 1;
  if (keys.KeyW || keys.ArrowUp)    moveY += 1;
  if (keys.KeyS || keys.ArrowDown)  moveY -= 1;

  // Normalize diagonal movement so speed is consistent
  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY);
    moveX /= length;
    moveY /= length;
  }

  // Apply movement (delta makes it smooth and frame-rate independent)
  mesh.position.x += moveX * moveSpeed * delta;
  mesh.position.y += moveY * moveSpeed * delta;
}

function animate() {
  timer.update();
  const delta = timer.getDelta(); // time since last frame in seconds

  upate_input(delta)

  render();
}

function render() {
  renderer.render( scene, camera );
}

function onKeyDown(event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = true;
  }
}

function onKeyUp(event) {
  if (keys.hasOwnProperty(event.code)) {
    keys[event.code] = false;
  }
}

