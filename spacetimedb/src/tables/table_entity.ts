// 

import { schema, table, t } from 'spacetimedb/server';
import { Vector3 } from '../types';

// need public and private table for only user and account

export const entity = table(
  { name: 'user', public: true },
  {
    id: t.string().primaryKey(), // xxx-xxx-xxx-xxx 
  }
);

export const transform2d = table(
  { name: 'transform2d', public: true },
  {
    entityId: t.string().primaryKey(), // xxx-xxx-xxx-xxx 
    position:Vector3,
    velocity:Vector3,
    rotation:t.f32(),
  }
);