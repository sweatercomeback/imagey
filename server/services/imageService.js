let fs = require('fs'),
    request = require('request'),
    rp = require('request-promise'),
    cheerio = require("cheerio"),
    getImageUrls = require('get-image-urls'),
    _ = require('lodash'),
    {getDimensions} = require('./common'),
    {isTrackingPixel, isLocalImage, processImageSrc} = require('./imageInspector'),
    {weight} = require('./imageWeight');

let {getFileName, getMimeType} = require('./common');

let url = '';

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

  // let cherioPromise = rp(options)
  //     .then(function ($) {
  //         let $imgs = $("img"),
  //         imageCount = $imgs.length;
  //
  //         console.log(`There are ${imageCount} images`);
  //         var imgList = _.map($imgs, (img)=>{
  //           return process(img);
  //         });
  //         allImages = _.union(allImages, imgList);
  //         return imgList;
  //     })
  //     .catch(function (err) {
  //         console.log("We’ve encountered an error: " + err);
  //   });


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




    return Promise.all([getImageUrlsPromise]).then(()=>{
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
                     .reject(isTrackingPixel)
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
