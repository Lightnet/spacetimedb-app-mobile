//-----------------------------------------------
// 
//-----------------------------------------------
import { table, t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
import { validateName } from '../helper';
//-----------------------------------------------
// 
//-----------------------------------------------
export const set_name = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  validateName(name);
  for(const _user of ctx.db.user.iter()){
    if(_user.identity){
      if(_user.identity){
        // const user = ctx.db.user.identity.find(ctx.sender);
        if(_user.identity == ctx.sender){
          _user.name = name;
          ctx.db.user.id.update(_user);
        }
      }
    }
  }
});

