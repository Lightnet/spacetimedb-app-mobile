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
import { 
  reset_entity_player,
  create_entity,
  delete_entity,
  add_entity_transform2d,
  remove_entity_transform2d,
  add_entity_box2d,
  add_entity_circle2d,
  remove_entity_body2d,

} from './reducers/reducer_entity';
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
  create_entity,
  delete_entity,
  add_entity_transform2d,
  remove_entity_transform2d,
  add_entity_box2d,
  add_entity_circle2d,
  remove_entity_body2d,
}

export default spacetimedb;