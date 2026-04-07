// index
// 
// 
import { connState, networkStatus, userIdentity } from './context';
import { DbConnection, tables } from './module_bindings';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "vanjs-core";
import { Modal, MessageBoard } from "vanjs-ui";
import { windowRegister } from './window_register';
import { windowLogin } from './window_login';

const { div, input, textarea, button, span, img, label, p, table, tr, td, tbody } = van.tags;

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-mobile';
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

const board = new MessageBoard({top: "20px"})

//-----------------------------------------------
//
//-----------------------------------------------
const conn = DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .withToken(localStorage.getItem(TOKEN_KEY) || undefined)
  .onConnect((conn, identity, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('connnect');
    networkStatus.val = 'Connected';
    connState.val = conn;
    // console.log("identity: ", identity);
    console.log("identity: ", identity.toHexString());
    // console.log("conn: ", conn);
    userIdentity.val = identity;
    initDB();
  })
  .onDisconnect(() => {
    console.log('Disconnected from SpacetimeDB');
    networkStatus.val = 'Disconnected';
  })
  .onConnectError((_ctx, error) => {
    console.error('Connection error:', error);
    networkStatus.val = 'Connection error';
    // statusEl.textContent = 'Error: ' + error.message;
    // statusEl.style.color = 'red';
  })
  .build();

function initDB(){
  // setUpDBUser();
}

function App(){
  const status = van.derive(()=>{
    console.log(networkStatus.val)
    return networkStatus.val;
  })

  return div(
    div(
      label(() => `Status: ${networkStatus.val}`),
    ),
    div(
      // button({onclick:()=>showLoginWindow()},'Login')
    )
  )
}

function showLoginWindow(){
  van.add(document.body, windowLogin())
}
// van.add(document.body, windowLogin())
van.add(document.body, App())
const pane = new Pane();
pane.addButton({title:'Login'}).on('click',()=>{
  van.add(document.body, windowLogin())
});
pane.addButton({title:'Register'}).on('click',()=>{
  van.add(document.body, windowRegister())
});
pane.addButton({title:'test foo'}).on('click',()=>{
  try {
    console.log(conn)
    // conn.reducers.authLogin({
      // alias:alias.val,
      // pass:pass.val,
    // });
    conn.reducers.testFoo({});

  } catch (error) {
    console.log("login error!")
  }
});
pane.addButton({title:'test'}).on('click',()=>{
  try {
    console.log("ts")
    conn.reducers.testAuth()

  } catch (error) {
    console.log("login error!")
  }
});

const accessEL = div({style:`
  // width:200px;
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
  height: 100vh;           /* needed for vertical centering */
  `});

const container = div({style:`
  width: 128px;
  height: 100px; 
  `})
accessEL.appendChild(container);

van.add(document.body, accessEL);
const accessPane = new Pane({container:container});

accessPane.addButton({title:'Login'}).on('click',()=>{
  van.add(document.body, windowLogin())
});
accessPane.addButton({title:'Register'}).on('click',()=>{
  van.add(document.body, windowRegister())
});
accessPane.addButton({title:'Recovery'}).on('click',()=>{
  // van.add(document.body, windowRegister())
  board.show({message: "Not Build!", durationSec: 1})
});