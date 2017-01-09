const fs = require('fs');
const request = require('request');
const _ = require('lodash');
const probe = require('probe-image-size');


function download(uri, filename, callback) {
  request.head(uri, () => {
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

function getFileName(str) {
  let f = _.last(_.split(str, '/'));
  f = _.replace(f, / /g, '_');
  f = _.replace(f, /%20/g, '_');
  return f;
}

function getMimeType(str) {
  const file = _.last(_.split(str, '.'));
  if (file.toLowerCase() === 'png') {
    return 'image/png';
  } else if (file.toLowerCase() === 'pdf') {
    return 'application/pdf';
  }
  return 'image/jpeg';
}

function getDimensions(imgUrl) {
  let url = imgUrl;
  if (_.startsWith(imgUrl, '//')) {
    url = `http:${imgUrl}`;
  }
  return probe(url);
}

module.exports = {
  download,
  getFileName,
  getMimeType,
  getDimensions,
};
