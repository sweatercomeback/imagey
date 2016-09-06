var getImageUrls = require('../index.js');

getImageUrls('http://www.msn.com/en-us/news/us/not-a-drill-seti-is-investigating-a-possible-extraterrestrial-signal-from-deep-space/ar-AAid9oY', function(err, images) {
  if (!err) {
    console.log('Images found', images.length);
    //console.log(images);
  }
  else {
    console.log(err);
  }
})
