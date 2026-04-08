

import { table, t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
import { Shape } from '../tables/table_entity';

export const set_user_input = spacetimedb.reducer({ 
  x: t.f32(),
  y: t.f32(),
}, (ctx, { x, y }) => {
  
  const user_input = ctx.db.userInput.identity.find(ctx.sender);

  //if no user input 
  if(!user_input){
    const entityId = ctx.newUuidV7().toString();
    // create user input
    ctx.db.userInput.insert({
      identity: ctx.sender, //need to test update call 
      userId: '',
      entityId: entityId,//need this for control assign entity id
      directionX: x,
      directionY: y,
      lastSentX: 0,
      lastSentY: 0
    });
    // create entity
    ctx.db.entity.insert({
      id: entityId,
      parentId: undefined,
      children: []
    });
    // create transform 2d
    ctx.db.transform2d.insert({
      entityId: entityId,
      position: {x:0,y:0,z:0},
      velocity: {x:0,y:0,z:0},
      rotation: 0
    })
    // create body 2d
    ctx.db.body2d.insert({
      entityId: entityId,
      params: Shape.Circle({radius: 0.5})
    });

  }

  if(user_input){
    console.log('update input x:', x, ' y:',y);
    user_input.directionX = x
    user_input.directionY = y
    ctx.db.userInput.entityId.update(user_input);
    // scheduled table
    // if input is true started schedule table
    // if input is false stop schedule table
    // if the jump it need to be check if ground for start and stop schedule table

  }

});

