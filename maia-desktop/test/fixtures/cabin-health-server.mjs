import http from 'node:http';

const host = process.env.HOSTNAME || '127.0.0.1';
const port = Number(process.env.PORT);

const server = http.createServer((request, response) => {
  if (request.url === '/api/cabin/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ready', mode: process.env.MAIA_CABIN_MODE || null }));
    return;
  }

  response.writeHead(404);
  response.end();
});

server.listen(port, host);
