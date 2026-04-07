
import { table, t } from 'spacetimedb/server';
import spacetimedb from '../module';
import { users } from '../tables/table_user';

export const my_user = spacetimedb.view(
  { name: 'my_user', public: true },
  t.option(users.rowType),
  // @ts-ignore
  (ctx) => {
    // const row = ctx.db.users.identity.find(ctx.sender);
    // return row ?? undefined;
    return [];
  }
);