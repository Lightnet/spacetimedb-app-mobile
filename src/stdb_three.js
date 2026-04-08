import * as THREE from 'three';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "vanjs-core";
import { Modal, MessageBoard } from "vanjs-ui";
import { DbConnection, tables } from './module_bindings';

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-mobile';
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

const board = new MessageBoard({top: "20px"})

let camera, scene, renderer, timer;

// let mesh;

let optionEntityBinding;

let transform2DFolder;
let addTransform2DBinding;
let removeTransform2DBinding;

let body2DFolder;
let addBox2DBinding;
let addCircle2DBinding;
let removeBody2DBinding;

const PARAMS = {
  entityId:'',
  // 
  // ph_position:{x:0,y:0,z:0},
  ph_position:{x:0,y:0},
  ph_rotation:0,

  ph_box2d:{x:1,y:1},
  ph_radius2d:0.5,
  // 
  entities:[],
  transform2d:[],
  shapes:[],
  bodies:[],
}


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
  setupEntity();
  setupTransform2D();
  setupBody2D();
}
//-----------------------------------------------
// 
//-----------------------------------------------
function onInsert_Entity(ctx, row){
  // console.log(row);
  PARAMS.entities.push(row);
  update_options_entities();
}

function onUpdate_Entity(ctx, oldRow, newRow){
  PARAMS.transform2d.push(newRow);
  PARAMS.entities=PARAMS.entities.filter(r=>r.entityId != newRow.entityId)
  PARAMS.entities.push(newRow)
}

function onDelete_Entity(ctx, row){
  PARAMS.entities=PARAMS.entities.filter(r=>r.entityId != row.entityId)
}

function setupEntity(){
  conn.subscriptionBuilder()
    .subscribe(tables.entity)
  conn.db.entity.onInsert(onInsert_Entity);
  conn.db.entity.onUpdate(onUpdate_Entity);
  conn.db.entity.onDelete(onDelete_Entity);
}
//-----------------------------------------------
// 
//-----------------------------------------------
function onInsert_body2d(ctx, row){
  console.log("body2d: ", row);
  PARAMS.bodies.push(row);
  for (const mesh of scene.children){
    if(mesh.userData?.row?.entityId == row.entityId){
      let circle = createCircle2D();
      circle.userData.row = row;
      mesh.add(circle)
      break;
    }
  }
}

function onUpdate_body2d(ctx, oldRow, newRow){

}

function onDelete_body2d(ctx, row){
  PARAMS.bodies=PARAMS.bodies.filter(r=>r.entityId!=row.entityId)
}

function setupBody2D(){
  conn.subscriptionBuilder()
    .subscribe(tables.body2d)
  conn.db.body2d.onInsert(onInsert_body2d);
  conn.db.body2d.onUpdate(onUpdate_body2d);
  conn.db.body2d.onDelete(onDelete_body2d);
}

// function update_player_position(row){
//   if(mesh){
//     mesh.position.set(
//       row.position.x,
//       row.position.y,
//       row.position.z
//     )
//   }
// }

function createMarker(){
  const geometry = new THREE.OctahedronGeometry(0.4);
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  return new THREE.LineSegments(edges, lineMaterial);
}


function create_mesh_transform(row){
  const _axesHelper = new THREE.AxesHelper( 1 );
  _axesHelper.userData.row = row;
  scene.add(_axesHelper)
  _axesHelper.position.set(
    row.position.x,
    row.position.y,
    row.position.z
  )
  PARAMS.shapes.push(row);
}

function onInsert_transform2d(ctx, row){
  // console.log("transform:", row)
  // console.log("transform: x:", row.position.x," y:" ,row.position.y)
  // update_player_position(row);
  create_mesh_transform(row)
  PARAMS.transform2d.push(row);
}

function onUpdate_transform2d(ctx, oldRow, newRow){
  // console.log("update transform:", newRow)
  // console.log("transform: x:", newRow.position.x," y:" ,newRow.position.y)
  // update_player_position(newRow);

  for (const mesh of scene.children){
    if(mesh.userData?.row?.entityId == newRow.entityId){
      mesh.position.set(
        newRow.position.x,
        newRow.position.y,
        newRow.position.z
      )
      break;
    }
  }

  PARAMS.transform2d=PARAMS.transform2d.filter(r=>r.entityId!= newRow.entityId)
  PARAMS.transform2d.push(newRow)
}

function onDelete_transform2d(ctx, row){
  PARAMS.transform2d=PARAMS.transform2d.filter(r=>r.entityId != row.entityId)
  for (const mesh of scene.children){
    if(mesh.userData?.row?.entityId == row.entityId){

      break;
    }
  }
  PARAMS.transform2d=PARAMS.transform2d.filter(r=>r.entityId!=row.entityId)
}

function setupTransform2D(){
  conn.subscriptionBuilder()
    .subscribe(tables.transform2d)
  conn.db.transform2d.onInsert(onInsert_transform2d);
  conn.db.transform2d.onUpdate(onUpdate_transform2d);
  conn.db.transform2d.onDelete(onDelete_transform2d);
}
//-----------------------------------------------
// 
//-----------------------------------------------
init();

function createBox2D(){
  const geometry = new THREE.PlaneGeometry( 1, 1 );
  const material = new THREE.MeshBasicMaterial({
    // color: 0x00ff00 //green
    color: 0x367ec2 //green
  });
  const mesh = new THREE.Mesh( geometry, material );
  return mesh;
}

function createCircle2D(){
  const geometry = new THREE.CircleGeometry( 0.5, 8 );
  const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  const circle = new THREE.Mesh( geometry, material );
  return circle;
}

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
  
  // mesh = createBox2D()
  // scene.add( mesh );

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

const entityFolder = pane.addFolder({
  title: 'Entity',
});

const btnEntity = entityFolder.addButton({
  title: 'Create Entity',
});
btnEntity.on('click', () => {
  conn.reducers.createEntity();
});

entityFolder.addBinding(PARAMS, 'entityId',{
  disabled:true,
  readyonly:true
});
entityFolder.addButton({title: 'Remove Entity'});
entityFolder.addButton({title: 'Refresh'}).on('click', () => {
  update_options_entities();
});
optionEntityBinding = entityFolder.addBlade({
  view: 'list',
  label: 'Entity',
  options: [
    // {text: 'loading', value: 'LDG'},
    // {text: 'menu', value: 'MNU'},
    // {text: 'field', value: 'FLD'},
  ],
  value: '',
});


function update_options_entities(){
  if(!entityFolder) return;
  if(!optionEntityBinding) return;
  if(optionEntityBinding) optionEntityBinding.dispose();

  let optionEntities = [];
  console.log("update_options_entities");
  for(const entity of PARAMS.entities){
    console.log(entity);
    optionEntities.push({
      text:entity.id, value:entity.id
    })
  }
  console.log(entityFolder);
  optionEntityBinding = entityFolder.addBlade({
    view: 'list',
    label: 'Entity',
    options: optionEntities,
    value: '',
  }).on('change', (ev) => {
    // console.log(ev.value)
    onSelectEntity(ev.value)
  });
}

function onSelectEntity(id){
  
  const entity = PARAMS.entities.find(r=>r.id==id)
  transform2DFolder.disabled = true;
  body2DFolder.disabled = true;
  addBox2DBinding.disabled = true;
  addCircle2DBinding.disabled = true;
  if(!entity){
    console.log("not found!")
    return;
  }
  PARAMS.entityId = id;
  const _transform2d = PARAMS.transform2d.find(r=>r.entityId==id)
  if(_transform2d){
    transform2DFolder.disabled = false;
    addTransform2DBinding.disabled = true;
    removeTransform2DBinding.disabled = false;
  }else{
    transform2DFolder.disabled = false;
    addTransform2DBinding.disabled = false;
    removeTransform2DBinding.disabled = true;
  }

  const _body = PARAMS.bodies.find(r=>r.entityId==id)
  console.log(_body)
  if(_body){
    body2DFolder.disabled = false;
    if(_body.params.tag == "Circle"){
      addCircle2DBinding.disabled = true;
    }else{
      addCircle2DBinding.disabled = false;
    }
    if(_body.params.tag == "Box"){
      addBox2DBinding.disabled = true;
    }else{
      addBox2DBinding.disabled = false;
    }
    removeBody2DBinding.disabled = false
  }else{
    body2DFolder.disabled = false;
    removeBody2DBinding.disabled = true;
    addCircle2DBinding.disabled = false;
    addBox2DBinding.disabled = false;
  }
  
  console.log(entity);
}


const playerFolder = pane.addFolder({
  title: 'Player',
});

playerFolder.addButton({
  title: 'Reset',
}).on('click', () => {
  conn.reducers.resetEntityPlayer({
    x:0,
    y:0
  })
});

transform2DFolder = pane.addFolder({
  title: 'Transform 2D',
});
transform2DFolder.addBinding(PARAMS, 'ph_position');
transform2DFolder.addBinding(PARAMS, 'ph_rotation');
addTransform2DBinding = transform2DFolder.addButton({title: 'Add Transform 2D',})
  .on('click',()=>{
    console.log(PARAMS.entityId)
    conn.reducers.addEntityTransform2D({
      id:PARAMS.entityId
    })
  })
removeTransform2DBinding = transform2DFolder.addButton({title: 'Remove Transform 2D',})
  .on('click',()=>{
    console.log(PARAMS.entityId)
    conn.reducers.removeEntityTransform2D({
      id:PARAMS.entityId
    })
  })
transform2DFolder.disabled = true;

body2DFolder = pane.addFolder({
  title: 'Body 2D',
});
body2DFolder.addBinding(PARAMS, 'ph_box2d');

addBox2DBinding = body2DFolder.addButton({title: 'Add Box',});
body2DFolder.addBinding(PARAMS, 'ph_radius2d');
addCircle2DBinding = body2DFolder.addButton({title: 'Add Circle',});
removeBody2DBinding = body2DFolder.addButton({title: 'Remove Body',});
body2DFolder.disabled = true;

