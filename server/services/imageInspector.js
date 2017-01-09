const _ = require('lodash');

function isLocalImage(src, url) {
  return src.includes(url.replace('https://', '').replace('http://', ''));
}

function isTrackingPixel(img) {
  return img.dimensions.height === 1;
}

function processImageSrc(src, url) {
  let cleanUrl = url;
  if (!src) {
    return '';
  }
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }
  if (!cleanUrl.endsWith('/') && !src.startsWith('/')) {
    cleanUrl = `${cleanUrl}/`;
  }
  return `${cleanUrl}${src}`;
}

function weight(img, index) {
  const weightedImg = _.clone(img);
  // add weight if first
  if (index === 0) {
    weightedImg.weight += 1;
  }

  if (weightedImg.src.includes('logo')) {
    weightedImg.weight += 5;
  }

  return weightedImg;
}

module.exports = {
  isLocalImage,
  isTrackingPixel,
  processImageSrc,
  weight,
};
