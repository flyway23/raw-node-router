import { rejects } from "node:assert";
import { resolve } from "node:dns";
import http from "node:http";
import { stringify } from "node:querystring";
import { buffer } from "node:stream/consumers";

const message = "Hello from the API";

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
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      return resolve(Buffer.concat(chunks).toString());
    });
    req.on("error", () => {
      reject("error in readBody");
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  if (path === "/") {
    return send(res, 200, "Home");
  }

  if (path === "/about") {
    return send(res, 200, "About page");
  }

  if (path === "/contact") {
    return send(res, 200, "Contact page");
  }

  if (path === "/api") {
    if (req.method == "GET") {
      return send(res, 200, message);
    }
    res.setHeader("Allow", "GET");
    return send(res, 405, "not the right method");
  }

  if (path === "/greet") {
    const name = url.searchParams.get("name") || "stranger";
    return send(res, 200, `Hello, ${name}`);
  }

  if (path === "/users") {
    if (req.method === "GET") {
      return send(res, 200, "u shall have it ");
    }

    if (req.method === "POST") {
      const raw = await readBody(req);
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return sendJson(res, 400, { error: "Invalid JSON" });
      }
      return sendJson(res, 201, { message: `User created: ${data.name}` });
    }
    res.setHeader("Allow", "GET POST");
    return send(res, 405, "send correct method");
  }

  send(res, 404, `Not found: ${path}`);
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
