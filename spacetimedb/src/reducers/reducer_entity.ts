

import { table, t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
import { validateName } from '../helper';

export const create_entity = spacetimedb.reducer((ctx) => {
  console.log("test");
  ctx.db.entity.insert({
    id:ctx.newUuidV7().toString()
  })
});


export const delete_entity = spacetimedb.reducer({id:t.string()},(ctx,{id}) => {
  console.log("test");
  ctx.db.entity.id.delete(id);
});

export const reset_entity_player = spacetimedb.reducer({
  x:t.f64(),
  y:t.f64(),
},(ctx,{x,y}) => {
  console.log("test");

  const _userInput = ctx.db.userInput.identity.find(ctx.sender)
  if(_userInput){
    const _transform2d = ctx.db.transform2d.entityId.find(_userInput.entityId)
    if(_transform2d){
      _transform2d.position.x=x ?? 0;
      _transform2d.position.y=y ?? 0;
      ctx.db.transform2d.entityId.update(_transform2d);
    }
  }
});