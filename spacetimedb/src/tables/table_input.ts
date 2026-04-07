import { schema, table, t } from 'spacetimedb/server';

export const userInput = table(
  { name: 'user_input', public: true },
  {
    entityId: t.string().primaryKey(), // xxx-xxx-xxx-xxx
    identity:t.identity().unique(),
    userId:t.string().unique(),
    directionX:t.f32(),
    directionY:t.f32(),
    lastSentX:t.f32(),
    lastSentY:t.f32(),
    // isFired:t.bool(),
  }
);
