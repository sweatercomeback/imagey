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
      alt = img.attribs['alt'] !== undefined ? img.attribs['alt'] : '',
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

function getAllImageUrls(url) {
  return getImageUrls(url)
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
}

function ripImagesFromPage(url) {
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
         var imgList = _.chain($imgs)
                          .map((img)=>{
                             return process(img);
                           })
                           .uniqBy("src")
                           .value();
        //  return _.map(imgList, (img)=>{
        //    return weight(img);
        //  });
        return imgList;
     })
     .catch(function (err) {
         console.log("We’ve encountered an error: " + err);
   });
}

function mergeImages(allImages, newList) {
  if(allImages.length === 0) {
    return newList;
  }
  _.each(newList, (item)=>{
    var existing = _.find(allImages, { 'src': item.src});
    if(!existing) {
      allImages.push(item);
    } else {
      if(!existing.alt) {
        existing.alt = item.alt;
      }
    }
  });
  return allImages;
}

function getImagesFromUrl(pullFrom) {
  url = pullFrom;
    var allImages = [];

    let getImageUrlsPromise = getAllImageUrls(url).then((list)=>{
      console.log("getImageUrls", list);
      allImages = mergeImages(allImages, list);
    });
    let ripImagesPromise = ripImagesFromPage(url).then((list)=>{
      console.log("rip images returns", list)
      allImages = mergeImages(allImages, list);
    });

      return Promise.all([getImageUrlsPromise, ripImagesPromise]).then(()=>{
          let unique, takeCount = 50;
          if(allImages.length > takeCount) {
            unique = _.take(allImages, takeCount);
          } else {
            unique = allImages;
          }

          console.log("getting dimensions");
          var infoPromise = _.map(unique, function(item) {
              let result;

              if(!item || !item.src || _.startsWith(item.src, "data:")) {
                item.dimensions = {};
                return Promise.resolve({});
              }
              try {

                result = getDimensions(item.src).then((dim)=>{
                  item.dimensions = dim;
                }, ()=>{
                  item.dimensions = {};
                });
                } catch(err) {
                  item.dimensions = {};
                  result = Promise.resolve({});
                }
                return result;
            });

            return Promise.all(infoPromise).then(function() {
              console.log("dimensions returned");
              var values = _.chain(unique)
                       .reject(isTrackingPixel)
                       .map(weight)
                       .sortBy(sortImagesByWeight)
                       .reverse()
                       .value();
              console.log("done")
              return values;
            });
        });
}

// getImagesFromUrl("http://hapijs.com").then((data)=>{
//   console.log("returning", data);
// })

module.exports = {
  getImagesFromUrl: getImagesFromUrl
}
