let fs = require('fs'),
    request = require('request'),
    rp = require('request-promise'),
    cheerio = require("cheerio"),
    getImageUrls = require('../get-image-urls/index.js'),
    _ = require('lodash'),
    {getDimensions} = require('./common'),
    {isTrackingPixel, isLocalImage, processImageSrc} = require('./imageInspector'),
    {weight} = require('./imageWeight');

let {getFileName, getMimeType} = require('./common');


function process(img) {
  let src = processImageSrc(img.attribs['src'], url),
      alt = img.attribs['alt'],
      isLocal = isLocalImage(src, url),
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


    let getImageUrlsPromise = getImageUrls(url)
      .then((images) => {
        let list = _.chain(images)
          .map(processImagesFromUrl)
          .uniqBy("src")
          .value();
          return list;

      })
      .catch((e) => {
        console.log('ERROR', e);
      });

      getImageUrlsPromise.then((allImages)=>{
          let unique = allImages;//_.uniqBy(allImages, "src");
          var infoPromise = _.map(un, function(item) {
              return getDimensions(item.src).then((dim)=>{
                item.dimensions = dim;

              });
            });

            return Promise.all(infoPromise).then(function() {
              return _.chain(un)
                       .reject(isTrackingPixel)
                       .map(weight)
                       .sortBy(sortImagesByWeight)
                       .reverse()
                       .value();
            });
        });
}

// getImagesFromUrl("http://hapijs.com").then((data)=>{
//   console.log("returning", data);
// })

module.exports = {
  getImagesFromUrl: getImagesFromUrl
}
