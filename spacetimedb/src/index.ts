// main

import spacetimedb, {init , onConnect, onDisconnect, update_simulate} from './module';

// import { set_name } from './reducers/reducer_user'
// import { my_user } from './views/view_user';
// import { auth_login } from './reducers/reducer_auth';
// import { test_foo } from './reducers/reducer_test';

export * from './reducers/reducer_user'
export * from './views/view_user'
export * from './reducers/reducer_auth';
export * from './reducers/reducer_test'; // export all functions
export * from './reducers/reducer_input'; // export all functions
import { reset_entity_player } from './reducers/reducer_entity';
export {
  // spacetimedb predefine
  init,
  onConnect,
  onDisconnect,
  // 
  update_simulate,
  // set_name,
  // my_user,
  // auth_login,
  // test
  // test_foo
  // 
  reset_entity_player,
}

export default spacetimedb;