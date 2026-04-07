import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "vanjs-core";
import { Modal, MessageBoard } from "vanjs-ui";
import { DbConnection, tables } from './module_bindings';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-mobile';
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

const board = new MessageBoard({top: "20px"})

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

const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem(TOKEN_KEY) || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    // console.log('connnect');
    // networkStatus.val = 'Connected';
    // connState.val = conn;
    // console.log("identity: ", identity);
    console.log("identity: ", identity.toHexString());
    // console.log("conn: ", conn);
    // userIdentity.val = identity;
    initDB();
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    // networkStatus.val = 'Disconnected';
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    // networkStatus.val = 'Connection error';
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();

function initDB(){
  // setUpDBUser();
  setupTransform2D();
}

function update_player_position(row){
  if(mesh){
    mesh.position.set(
      row.position.x,
      row.position.y,
      row.position.z
    )
  }
}

function onInsert_transform2d(ctx, row){
  // console.log("transform:", row)
  console.log("transform: x:", row.position.x," y:" ,row.position.y)
  update_player_position(row)
}

function onUpdate_transform2d(ctx, oldRow, newRow){
  // console.log("update transform:", newRow)
  console.log("transform: x:", newRow.position.x," y:" ,newRow.position.y)
  update_player_position(newRow)
}

function setupTransform2D(){
  conn.subscriptionBuilder()
    .subscribe(tables.transform2d)
  conn.db.transform2d.onInsert(onInsert_transform2d);
  conn.db.transform2d.onUpdate(onUpdate_transform2d);
}

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
let lastSentX = 0;
let lastSentY = 0;

function upate_input(delta){
  // Calculate movement direction
  let inputX = 0;
  let inputY = 0;

  if (keys.KeyA || keys.ArrowLeft)  inputX -= 1;
  if (keys.KeyD || keys.ArrowRight) inputX += 1;
  if (keys.KeyW || keys.ArrowUp)    inputY += 1;
  if (keys.KeyS || keys.ArrowDown)  inputY -= 1;

  // Normalize diagonal movement so speed is consistent
  if (inputX !== 0 || inputY !== 0) {
    const length = Math.hypot(inputX, inputY);
    inputX /= length;
    inputY /= length;
  }

  // Apply movement (delta makes it smooth and frame-rate independent)
  // mesh.position.x += inputX * moveSpeed * delta;
  // mesh.position.y += inputY * moveSpeed * delta;

  // Send the current input to the server
  if (Math.abs(inputX  - lastSentX) > 0.001 || Math.abs(inputY - lastSentY) > 0.001) {
    console.log("move");
    conn.reducers.setUserInput({
      x: inputX,
      y: inputY
    });
    lastSentX = inputX;
    lastSentY = inputY;
  }
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

const pane = new Pane();

const btn = pane.addButton({
  title: 'Reset',

});
btn.on('click', () => {
  conn.reducers.resetEntityPlayer({
    x:0,
    y:0
  })
});