let Hapi = require('hapi');
let imageService = require('./services/imageService');
let server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.route([
  { method: 'GET',   path: '/{path*}', handler : {directory: { path: 'app' , listing: false, index: true }}}
]);

server.route({
  method: 'POST'
, path: '/images'
, config: {
    handler: function(req, reply) {
      var url = req.payload.url;

      imageService.getImagesFromUrl(url).then((res)=>{
        reply(res);
      })

    }
  }
});


server.start(function(err) {
  if (err) return callback('Failed to start server', err);

  console.log('Server started at: ', server.info.uri);
});

module.exports = server;
