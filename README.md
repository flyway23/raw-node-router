# RAW NODE ROUTER

**This is a learning exercise to understand how routing works under the hood.(NO Express or libraries)**

Implements a bare-bone routing server using http module of Node.js.

## How it works

- Routes are stored as data ({ method, pattern, handler }), not if/else chains.

- A matchPath() function checks a pattern like /users/:id against a real path and pulls out params.

- One dispatcher loops through the routes table to find a match, instead of routing logic being repeated per-route.

- Unknown paths return 404. Known paths with the wrong method return 405.
