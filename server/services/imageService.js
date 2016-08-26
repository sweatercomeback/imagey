let fs = require('fs'),
    request = require('request'),
    rp = require('request-promise'),
    cheerio = require("cheerio"),
    _ = require('lodash');

let {getFileName, getMimeType} = require('./common');

let url = 'https://a.shipb.us/imageytest';

function isLocalImage(src){
  return src.includes(url.replace('https://', '').replace('http://', ''));
}

function processImageSrc(src) {
  if(src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  return `${url}/${src}`;
}

function process(img) {
  let src = processImageSrc(img.attribs['src']),
      alt = img.attribs['alt'],
      isLocal = isLocalImage(src),
      weight = 0;

  return {
    src: src,
    alt: alt,
    weight: weight
  }
}

function weight(imgs) {
  return imgs;
}

function getImagesFromUrl(url) {

  var options = {
      uri: url,
      transform: function (body) {
          return cheerio.load(body);
      }
  };

  return rp(options)
      .then(function ($) {
          let $imgs = $("img"),
          imageCount = $imgs.length;

          console.log(`There are ${imageCount} images`);
          var imgList = _.map($imgs, (img)=>{
            return process(img);
          });
          return _.map(imgList, (img)=>{
            return weight(img);
          });
      })
      .catch(function (err) {
          console.log("We’ve encountered an error: " + err);
    });
}

module.exports = {
  getImagesFromUrl: getImagesFromUrl
}
