let fs = require('fs'),
    request = require('request'),
    rp = require('request-promise'),
    cheerio = require("cheerio"),
    getImageUrls = require('get-image-urls'),
    _ = require('lodash'),
    {getDimensions} = require('./common');

let {getFileName, getMimeType} = require('./common');

let url = '';

function isLocalImage(src){
  return src.includes(url.replace('https://', '').replace('http://', ''));
}

function isTrackingPixel(img) {
    return (img.dimensions.height === 1 && img.dimensions.length === 1);
}

function processImageSrc(src) {
  if(src.startsWith('http') || src.startsWith('//')) {
    return src;
  }
  if(!url.endsWith('/') && !src.startsWith('/')) {
    url = `${url}/`;
  }
  return `${url}${src}`;
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

function processImagesFromUrl(img) {
  let src = img.url,
      alt = '',
      isLocal = null,
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

function getImagesFromUrl(pullFrom) {
  url = pullFrom;
  let options = {
      uri: url,
      transform: function (body) {
          return cheerio.load(body);
      }
  };

  // let cherioPromise = rp(options)
  //     .then(function ($) {
  //         let $imgs = $("img"),
  //         imageCount = $imgs.length;
  //
  //         console.log(`There are ${imageCount} images`);
  //         var imgList = _.map($imgs, (img)=>{
  //           return process(img);
  //         });
  //         return _.map(imgList, (img)=>{
  //           return weight(img);
  //         });
  //     })
  //     .catch(function (err) {
  //         console.log("We’ve encountered an error: " + err);
  //   });

    return getImageUrls(url)
      .then((images) => {
        let list = _.chain(images)
          .map(processImagesFromUrl)
          .uniq(function(item, key, src) {
              return item.src;
          })
          .value();

        let infoPromises = _.map(list, function(item) {
            return getDimensions(item.src).then((dim)=>{
              item.dimensions = dim;
            });
        });

        return Promise.all(infoPromises).then(()=>{
            return _.reject(list, isTrackingPixel);
        });

      })
      .catch((e) => {
        console.log('ERROR', e);
      });
}

// getImagesFromUrl("http://dayoftheshirt.com").then((data)=>{
//   console.log(data);
// })

module.exports = {
  getImagesFromUrl: getImagesFromUrl
}
