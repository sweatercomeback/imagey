const _ = require('lodash');

function weight(img, index) {
  const weightedImg = _.clone(img);
  weightedImg.weight = 0;

  // add weight if first
  if (index === 0) {
    weightedImg.weight += 1;
  }

  if (weightedImg.src.includes('logo')) {
    weightedImg.weight += 2;
  }

  // find appropriately sized images - in the goldilocks zone
  if (weightedImg.dimensions.height > 175 && weightedImg.dimensions.height < 900) {
    weightedImg.weight += 2;
  } else {
    weightedImg.weight -= 2;
  }

  if (weightedImg.alt.length > 1) {
    weightedImg.weight += 1;
  }
  if (img.alt.length > 25) {
    weightedImg.weight += 1;
  }

  return weightedImg;
}

module.exports = {
  weight,
};
