
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
  weight: weight
}
