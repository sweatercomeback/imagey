var fs = require('fs'),
    request = require('request'),
    _ = require('lodash'),
    http = require('http'),
    url = require('url'),
    probe = require('probe-image-size');




function download(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function getFileName(str) {
  let f = _.last(_.split(str, '/'));
  f = _.replace(f, / /g, '_');
  f = _.replace(f, /%20/g, '_');
  return f;

}

function getMimeType(str) {
  var file = _.last(_.split(str, '.'));
  if(file.toLowerCase() === 'png') {
    return 'image/png';
  }
  else if(file.toLowerCase() === 'pdf') {
    return 'application/pdf';
  }
  else {
    return 'image/jpeg';
  }
}

function getDimensions(imgUrl) {
  return probe(imgUrl);
}

module.exports = {
  download: download,
  getFileName: getFileName,
  getMimeType: getMimeType,
  getDimensions: getDimensions
}
