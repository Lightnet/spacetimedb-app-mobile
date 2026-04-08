//-----------------------------------------------
// REDUCER ENTITY
//-----------------------------------------------
import { table, t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
// import { validateName } from '../helper';
import { Shape } from '../tables/table_entity';
//-----------------------------------------------
// CREATE ENTITY
//-----------------------------------------------
export const create_entity = spacetimedb.reducer((ctx) => {
  console.log("create_entity");
  ctx.db.entity.insert({
    id: ctx.newUuidV7().toString(),
    parentId: undefined,
    children: []
  })
});
//-----------------------------------------------
// DELETE ENTITY
//-----------------------------------------------
export const delete_entity = spacetimedb.reducer({id:t.string()},(ctx,{id}) => {
  console.log("delete_entity");
  ctx.db.entity.id.delete(id);
});
//-----------------------------------------------
// ADD TRANSFORM 2D
//-----------------------------------------------
export const add_entity_transform2d = spacetimedb.reducer({id:t.string()},(ctx,{id}) => {
  console.log("add_entity_transform2d");
  const _entity = ctx.db.entity.id.find(id);
  if(_entity){
    ctx.db.transform2d.insert({
      entityId: id,
      position: {x:0,y:0,z:0},
      velocity: {x:0,y:0,z:0},
      rotation: 0
    });
  }
});
//-----------------------------------------------
// REMOVE ENTITY TRANSFORM 2D
//-----------------------------------------------
export const remove_entity_transform2d = spacetimedb.reducer({id:t.string()},(ctx,{id}) => {
  console.log("remove_entity_transform2d:", id);
  const result  = ctx.db.transform2d.entityId.delete(id);
  console.log("result:" , result);
});
//-----------------------------------------------
// ADD ENTITY BODY BOX 2D
//-----------------------------------------------
export const add_entity_box2d = spacetimedb.reducer({
  id:t.string(),
  width:t.f32(),
  height:t.f32()
},(ctx,{id, width , height}) => {
  console.log("add_entity_transform2d");
  const _entity = ctx.db.entity.id.find(id);
  if(_entity){
    ctx.db.body2d.insert({
      entityId: id,
      params: Shape.Box({
        width: width,
        height: height
      })
    });
  }
});
//-----------------------------------------------
// ADD ENTITY BODY CIRCLE 2D
//-----------------------------------------------
export const add_entity_circle2d = spacetimedb.reducer({
  id:t.string(),
  radius:t.f32(),
},(ctx,{id, radius}) => {
  console.log("add_entity_circle2d");
  const _entity = ctx.db.entity.id.find(id);
  if(_entity){
    ctx.db.body2d.insert({
      entityId: id,
      params: Shape.Circle({radius: radius })
    });
  }
});
//-----------------------------------------------
// REMOVE ENTITY BODY BOX 2D
//-----------------------------------------------
export const remove_entity_body2d = spacetimedb.reducer({id:t.string()},(ctx,{id}) => {
  console.log("remove_entity_body2d");
  ctx.db.body2d.entityId.delete(id);
});
//-----------------------------------------------
// RESET ENTITY PLAYER
//-----------------------------------------------
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
//-----------------------------------------------
// 
//-----------------------------------------------