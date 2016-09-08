function isLocalImage(src, url){
  return src.includes(url.replace('https://', '').replace('http://', ''));
}

function isTrackingPixel(img) {
    return img.dimensions.height === 1;
}

function processImageSrc(src, url) {
  if(!src) {
    return '';
  }
  if(src.startsWith('http') || src.startsWith('//')) {
    return src;
  }
  if(!url.endsWith('/') && !src.startsWith('/')) {
    url = `${url}/`;
  }
  return `${url}${src}`;
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

module.exports = {
  isLocalImage: isLocalImage,
  isTrackingPixel: isTrackingPixel,
  processImageSrc: processImageSrc,
  weight: weight
}
