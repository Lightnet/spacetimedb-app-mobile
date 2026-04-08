//-----------------------------------------------
// MODULE
//-----------------------------------------------
import { ScheduleAt } from 'spacetimedb';
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { sessions } from './tables/table_session';
import { users, userAuth } from './tables/table_user';
import { body2d, entity, transform2d } from './tables/table_entity';
import { userInput } from './tables/table_input';
//-----------------------------------------------
// 
//-----------------------------------------------
const simulateInput = table(
  { name: 'simulate_input', scheduled: (): any => update_simulate },
  {
    scheduled_id: t.u64().primaryKey().autoInc(),
    scheduled_at: t.scheduleAt(),
    message: t.string().optional(),
    userId:t.string().optional(),
    last_tick_timestamp:t.timestamp(),
    dt:t.f32(),
  }
);
//-----------------------------------------------
// SCEHEMA
//-----------------------------------------------
const spacetimedb = schema({
  sessions,
  users,
  userAuth,
  userInput,
  entity,
  transform2d,
  body2d,
  simulateInput,
});

export const update_simulate = spacetimedb.reducer({ arg: simulateInput.rowType }, (ctx, { arg }) => {
  
  // Invoked automatically by the scheduler
  // arg.message, arg.scheduled_at, arg.scheduled_id
  const now = ctx.timestamp;                    // current wall time
  let dt = 0;                       // we'll compute this
  if (arg.last_tick_timestamp) {        // not first tick
    const elapsed_ms = now.since(arg.last_tick_timestamp).millis;
    // console.log("elapsed_ms: ", elapsed_ms);
    dt = elapsed_ms / 1000.0;       // in seconds
  } else {
    dt = 0.033;                     // fallback
  }
  let speed = 5;
  // console.log("dt:", dt);
  // console.log("count:", ctx.db.userInput.count());

  for(const _userInput of ctx.db.userInput.iter()){
    // console.log("D x:",_userInput.directionX)
    if (!_userInput.entityId) continue;
    const _transform2d = ctx.db.transform2d.entityId.find(_userInput.entityId)
    if(!_transform2d) continue;
    // console.log('update?')
    // --- Only update if there's actual movement ---
    let moved = false;
    // const oldX = _transform2d.position.x;
    // const oldY = _transform2d.position.y;

    if (_userInput.directionX > 0) {
      _transform2d.position.x += ( speed * dt ) * 1;
      moved = true;
    } else if (_userInput.directionX < 0) {
      _transform2d.position.x -=  ( speed * dt ) *1;
      moved = true;
    }

    if (_userInput.directionY > 0) {
      _transform2d.position.y +=  ( speed * dt ) *1;
      moved = true;
    } else if (_userInput.directionY < 0) {
      _transform2d.position.y -=  ( speed * dt ) *1;
      moved = true;
    }

    // Only call update when something actually changed
    if (moved) {
      console.log('update move...')
      ctx.db.transform2d.entityId.update(_transform2d);
    }

  }

  ctx.db.simulateInput.scheduled_id.update({
    ...arg,
    last_tick_timestamp: now,
    dt:dt,
  });
});

//-----------------------------------------------
// INIT
//-----------------------------------------------
export const init = spacetimedb.init(ctx => {
  console.log("===============INIT SPACETIMEDB APP NAME:::=========");
  let isFound = false;
  for(const _user of  ctx.db.users.iter()){
    if(_user.identity){
      if(_user.identity == ctx.sender){
        isFound=true;
      }
    }
  }

  if(!isFound){
    console.log('Create USER!');
    ctx.db.users.insert({
      name: undefined,
      identity: ctx.sender,
      id: ctx.newUuidV7().toString(),
      online: true
    })
  }

  ctx.db.simulateInput.insert({
    scheduled_id: 0n,
    scheduled_at: ScheduleAt.interval(33333n), // Schedule to run every 30 tick
    message: undefined,
    userId: undefined,
    last_tick_timestamp: ctx.timestamp,
    dt: 0
  })

});
//-----------------------------------------------
// ON CLIENT CONNECT
//-----------------------------------------------
export const onConnect = spacetimedb.clientConnected(ctx => {
  // ctx.connectionId is guaranteed to be defined
  const connId = ctx.connectionId!;
  // console.log(ctx.newUuidV7().toString())
  // ctx.timestamp
  
  // Initialize client session
  ctx.db.sessions.insert({
    connection_id: connId,
    identity: ctx.sender,
    connected_at: ctx.timestamp,
    userId: undefined
  });

  // const user = ctx.db.user.identity.find(ctx.sender);
  // if (user) {
  //   ctx.db.user.id.update({ ...user, online: true });
  // } else {
  //   // ctx.db.user.insert({
  //   //   identity: ctx.sender,
  //   //   name: ctx.newUuidV7().toString(),
  //   //   online: true,
  //   //   id: ctx.newUuidV7().toString()
  //   // });
  // }

});
//-----------------------------------------------
// ON CLIENT DISCONNECT
//-----------------------------------------------
export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const connId = ctx.connectionId!;

  const session = ctx.db.sessions.connection_id.find(connId);

  if(session){
    if(session.userId){
      const _user = ctx.db.users.id.find(session.userId)
      if(_user){

        const _userAuth = ctx.db.userAuth.userId.find(session.userId);
        if(_userAuth){
          //remove identity token in case someone use same token
          _userAuth.identity = undefined;

          _user.online = false;
          _user.identity = undefined;
        }
      }
    }
  }

  // ctx.connectionId is guaranteed to be defined
  // Clean up client session
  ctx.db.sessions.connection_id.delete(connId);

});

export default spacetimedb;
