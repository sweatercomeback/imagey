const Hapi = require('hapi');
const imageService = require('./services/imageService');

const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000,
});

server.route([
  { method: 'GET', path: '/{path*}', handler: { directory: { path: 'app', listing: false, index: true } } },
]);

server.route({
  method: 'POST',
  path: '/images',
  config: {
    handler: (req, reply) => {
      const url = req.payload.url;

      imageService.getImagesFromUrl(url)
        .then((res) => {
          reply(res);
        });
    },
  },
});


server.start((err) => {
  if (err) {
    return callback('Failed to start server', err);
  }
  console.log('Server started at: ', server.info.uri);
  return true;
});

module.exports = server;
