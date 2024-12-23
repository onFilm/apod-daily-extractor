const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('consolidated.json'); // <== Will be created later
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 443; // <== You can change the port

server.use(middlewares);
server.use(router);

server.listen(port);