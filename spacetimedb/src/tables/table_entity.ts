//-----------------------------------------------
// 
//-----------------------------------------------
import { schema, table, t } from 'spacetimedb/server';
import { Vector3 } from '../types';
// need public and private table for only user and account
//-----------------------------------------------
// 
//-----------------------------------------------
export const entity = table(
  { name: 'user', public: true },
  {
    id: t.string().primaryKey(), // xxx-xxx-xxx-xxx 
    parentId:t.string().optional(), //entityID string
    children:t.array(t.string()).default([]), //entityIDs string
  }
);
//-----------------------------------------------
// 
//-----------------------------------------------
export const transform2d = table(
  { name: 'transform2d', public: true },
  {
    entityId: t.string().primaryKey(), // xxx-xxx-xxx-xxx 
    position:Vector3,
    velocity:Vector3,
    rotation:t.f32(),
  }
);
//-----------------------------------------------
// Box parameters
//-----------------------------------------------
// Box parameters: width, height, depth
export const Box2DParams = t.object('BoxParams', {
  width: t.f32(),
  height: t.f32()
});
//-----------------------------------------------
// Sphere parameters: just radius
//-----------------------------------------------
export const Circle2DParams = t.object('SphereParams', {
  radius: t.f32()
});
//-----------------------------------------------
// ENUM {Box, Sphere}
//-----------------------------------------------
export const Shape = t.enum('Shape', {
  Box: Box2DParams,
  Circle: Circle2DParams
});
//-----------------------------------------------
// Body 2D
//-----------------------------------------------
export const body2d = table(
  { name: 'body2d', public: true },
  {
    entityId: t.string().primaryKey(), // xxx-xxx-xxx-xxx
    params: Shape // This column now accepts BoxParams OR SphereParams
  }
);