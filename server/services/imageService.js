const rp = require('request-promise');
const cheerio = require('cheerio');
const getImageUrls = require('../get-image-urls/index.js');
const _ = require('lodash');
const { getDimensions } = require('./common');
const { isTrackingPixel, processImageSrc } = require('./imageInspector');
const { weight } = require('./imageWeight');

function process(img) {
  const src = processImageSrc(img.attribs.src, url);
  const alt = img.attribs.alt !== undefined ? img.attribs.alt : '';
  const defaultWeight = 0;

  return {
    src,
    alt,
    weight: defaultWeight,
  };
}

function processImagesFromUrl(img) {
  const src = img.url;
  const alt = '';
  const defaultWeight = 0;

  return {
    src,
    alt,
    weight: defaultWeight,
  };
}


function sortImagesByWeight(img) {
  return img.weight;
}

function getAllImageUrls(url) {
  return getImageUrls(url)
    .then((images) => {
      const list = _.chain(images)
        .map(processImagesFromUrl)
        .uniqBy('src')
        .value();
      return list;
    })
    .catch((e) => {
      console.log('ERROR', e);
    });
}

function ripImagesFromPage(url) {
  const options = {
    uri: url,
    transform: (body) => {
      return cheerio.load(body);
    },
  };

  return rp(options)
     .then(($) => {
       const $imgs = $('img');
       const imageCount = $imgs.length;

       console.log(`There are ${imageCount} images`);
       const imgList = _.chain($imgs)
                          .map((img) => {
                            return process(img);
                          })
                           .uniqBy('src')
                           .value();
       return imgList;
     })
     .catch((err) => {
       console.log(`We've encountered an error: ${err}`);
     });
}

function mergeImages(allImages, newList) {
  if (allImages.length === 0) {
    return newList;
  }
  _.each(newList, (item) => {
    const existing = _.find(allImages, { src: item.src });
    if (!existing) {
      allImages.push(item);
    } else if (!existing.alt) {
      existing.alt = item.alt;
    }
  });
  return allImages;
}

function getImagesFromUrl(pullFrom) {
  url = pullFrom;
  let allImages = [];

  const getImageUrlsPromise = getAllImageUrls(url).then((list) => {
    allImages = mergeImages(allImages, list);
  });
  const ripImagesPromise = ripImagesFromPage(url).then((list) => {
    allImages = mergeImages(allImages, list);
  });

  return Promise.all([getImageUrlsPromise, ripImagesPromise]).then(() => {
    let unique;
    const takeCount = 50;
    if (allImages.length > takeCount) {
      unique = _.take(allImages, takeCount);
    } else {
      unique = allImages;
    }

    const infoPromise = _.map(unique, (item) => {
      let result;
      if (!item || !item.src || _.startsWith(item.src, 'data:')) {
        item.dimensions = {};
        return Promise.resolve({});
      }

      try {
        result = getDimensions(item.src).then((dim) => {
          item.dimensions = dim;
        }, () => {
          item.dimensions = {};
        });
      } catch (err) {
        item.dimensions = {};
        result = Promise.resolve({});
      }
      return result;
    });

    return Promise.all(infoPromise).then(() => {
      const values = _.chain(unique)
               .reject(isTrackingPixel)
               .map(weight)
               .sortBy(sortImagesByWeight)
               .reverse()
               .value();

      return values;
    });
  });
}

module.exports = {
  getImagesFromUrl,
};
