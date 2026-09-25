import http from "node:http";

//this is the dummy data  
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];
//bunch of helper functions
function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", () => reject(new Error("error in readBody")));
  });
}


function matchPath(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const actual = pathParts[i];
    if (pp.startsWith(":")) {
      params[pp.slice(1)] = actual;
    } else if (pp !== actual) {
      return null;
    }
  }
  return params;
}

//route table instead of if/else chain
const routes = [
  {
    method: "GET",
    pattern: "/",
    handler: (req, res) => send(res, 200, "Home"),
  },
  {
    method: "GET",
    pattern: "/about",
    handler: (req, res) => send(res, 200, "About page"),
  },
  {
    method: "GET",
    pattern: "/contact",
    handler: (req, res) => send(res, 200, "Contact page"),
  },
  {
    method: "GET",
    pattern: "/api",
    handler: (req, res) => send(res, 200, "Hello from the API"),
  },
  {
    method: "GET",
    pattern: "/greet",
    handler: (req, res, params, url) => {
      const name = url.searchParams.get("name") || "stranger";
      send(res, 200, `Hello, ${name}`);
    },
  },
  {
    method: "GET",
    pattern: "/users",
    handler: (req, res) => sendJson(res, 200, users),
  },
  {
    method: "POST",
    pattern: "/users",
    handler: async (req, res) => {
      const raw = await readBody(req);
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }
      if (!data.name || typeof data.name !== "string") {
        return sendJson(res, 400, { error: "Missing or invalid 'name' field" });
      }
      return sendJson(res, 201, { message: `User created: ${data.name}` });
    },
  },
  {
    method: "GET",
    pattern: "/users/:id",
    handler: (req, res, params) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        return sendJson(res, 400, { error: "Invalid user id" });
      }
      const user = users.find((u) => u.id === id);
      if (!user) {
        return sendJson(res, 404, { error: `User ${id} not found` });
      }
      return sendJson(res, 200, user);
    },
  },
];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
//goes through all the route path
  const matchingPath = routes.filter(
    (r) => matchPath(r.pattern, path) !== null,
  );

  if (matchingPath.length === 0) {
    return send(res, 404, `Not found: ${path}`);
  }

  const route = matchingPath.find((r) => r.method === req.method);

  if (!route) {
    const allowed = matchingPath.map((r) => r.method).join(", ");
    res.setHeader("Allow", allowed);//tells the client which one is allowrd
    return sendJson(res, 405, { error: "Method inccorect allowed" }); //single point to tell that the method is wrong
  }

  const params = matchPath(route.pattern, path);
  await route.handler(req, res, params, url);
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
