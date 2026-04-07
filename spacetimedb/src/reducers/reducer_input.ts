

import { table, t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';

export const set_user_input = spacetimedb.reducer({ 
  x: t.f32(),
  y: t.f32(),
}, (ctx, { x, y }) => {
  
  const user_input = ctx.db.userInput.identity.find(ctx.sender);

  if(!user_input){
    const entityId = ctx.newUuidV7().toString();
    ctx.db.userInput.insert({
      identity: ctx.sender,
      userId: '',
      entityId: entityId,
      directionX: x,
      directionY: y,
      lastSentX: 0,
      lastSentY: 0
    });
    ctx.db.entity.insert({
      id: entityId
    });
    ctx.db.transform2d.insert({
      entityId: entityId,
      position: {x:0,y:0,z:0},
      velocity: {x:0,y:0,z:0},
      rotation: 0
    })
  }

  if(user_input){
    console.log('update input x:', x, ' y:',y);
    user_input.directionX = x
    user_input.directionY = y
    ctx.db.userInput.entityId.update(user_input);
  }

});

