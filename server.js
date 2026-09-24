import http from "node:http";

const message = "Hello from the API";

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const path = req.url.split("?")[0];
  console.log(req.method, path);

  if (path === "/api") {
    return send(res, 200, message);
  }

  send(res, 404, `Not found: ${path}`);
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
