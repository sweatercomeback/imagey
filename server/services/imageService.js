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
    return !(img.dimensions.height === 1);
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

function weight(img, index) {
  //add weight if first
  if(index === 0) {
    img.weight += 1;
  }

  if(img.src.includes('logo')) {
    img.weight += 5;
  }

  return img;
}

function sortImagesByWeight(img) {
  return img.weight;
}

function getImagesFromUrl(pullFrom) {
  url = pullFrom;
  let options = {
      uri: url,
      transform: function (body) {
          return cheerio.load(body);
      }
  };
  var allImages = [];

  let cherioPromise = rp(options)
      .then(function ($) {
          let $imgs = $("img"),
          imageCount = $imgs.length;

          console.log(`There are ${imageCount} images`);
          var imgList = _.map($imgs, (img)=>{
            return process(img);
          });
          allImages = _.union(allImages, imgList);
          return imgList;
      })
      .catch(function (err) {
          console.log("We’ve encountered an error: " + err);
    });


    let getImageUrlsPromise = getImageUrls(url)
      .then((images) => {
        console.log("and "+images.length)
        let list = _.chain(images)
          .map(processImagesFromUrl)
          .value();
          allImages = _.union(allImages, list);
          return list;

      })
      .catch((e) => {
        console.log('ERROR', e);
      });




    return Promise.all([getImageUrlsPromise, cherioPromise]).then(()=>{
        let un = _.uniq(allImages, function(item, key, src) {
            return item.src;
        });
        var infoPromise = _.map(un, function(item) {
            return getDimensions(item.src).then((dim)=>{
              item.dimensions = dim;

            });
          });

          return Promise.all(infoPromise).then(function() {
            return _.chain(un)
                     .filter(isTrackingPixel)
                     .map(weight)
                     .sortBy(sortImagesByWeight)
                     .reverse()
                     .value();
          });

        });

}

// getImagesFromUrl("https://a.shipb.us/imageytest").then((data)=>{
//   console.log("returning", data);
// })

module.exports = {
  getImagesFromUrl: getImagesFromUrl
}
