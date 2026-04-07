# spacetimedb-app-mobile

# License: MIT

# SpaceTimeDB
 - 2.1.0

# Information:
  Working toward 2D scene world.

  This project for mobile game for multiplayer table top game idea. Some basic idea is party dice and mini games or turn base rogue like battle. PC or TV for visual battle while the mobile phone are use for controls and menus access for co-op battle. 

# Config:
  Make sure the application database name match the server and client. Since using the ***spacetime dev*** command line to run development mode to watch and build.

## Client
```js
const DB_NAME = 'spacetime-app-mobile';
```
## server:
spacetime.json
```json
//...
"database": "spacetime-app-mobile",
//...
```
spacetime.local.json
```json
//...
"database": "spacetime-app-mobile",
//...
```

# Commands:
```
bun install
```
```
spacetime start
```
```
spacetime dev --server local
```
# sql:
```
spacetime sql --server local spacetime-app-mobile "SELECT * FROM transform2d"
```

# Delete
```
spacetime publish --server local spacetime-app-mobile --delete-data
```