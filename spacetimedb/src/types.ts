import { schema, table, t, SenderError  } from 'spacetimedb/server';

export const status = t.enum('Status', ['Online', 'Offline','Idle','Busy']);

// Define a nested object type for coordinates
export const Vector3 = t.object('Vector3', {
  x: t.f64(),
  y: t.f64(),
  z: t.f64(),
});

export const Vector2 = t.object('Vector2', {
  x: t.f64(),
  y: t.f64()
});