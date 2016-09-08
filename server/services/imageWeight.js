
function weight(img, index) {
  console.log("weighting")

  img.weight = 0;

  //add weight if first
  if(index === 0) {
    img.weight += 1;
  }

  if(img.src.includes('logo')) {
    img.weight += 2;
  }

  //find appropriately sized images - in the goldilocks zone
  if(img.dimensions.height > 175 && img.dimensions.height < 900) {
    img.weight += 2;
  } else {
    img.weight = img.weight - 2;
  }

  if(img.alt.length > 1) {
    img.weight += 1;
  }
  if(img.alt.length > 25) {
    img.weight += 1;
  }

  console.log("end weighting", img)
  return img;
}

module.exports = {
  weight: weight
}
