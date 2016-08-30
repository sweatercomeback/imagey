var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

var {isTrackingPixel, processImageSrc} = require('../server/services/imageInspector');
var {weight} = require('../server/services/imageWeight');

describe('ImageService', function() {
  describe('isTrackingPixel', function() {
    it('should be true if the dimension height is 1', function() {
      var target = isTrackingPixel({dimensions: {height: 1}});
      expect(target).to.be.true;
    });
    it('should be false if the dimension height is 5', function() {
      var target = isTrackingPixel({dimensions: {height: 5}});
      expect(target).to.be.false;
    });
  });

  describe('processImageSrc', function() {
    it('should return the same url if it already has http', function() {
      var original = 'http://google.com';
      var target = processImageSrc(original);

      expect(target).to.equal(original);
    });
    it('should add the url if it is local', function() {
      var original = '/test.jpg';
      var url = 'http://google.com';
      var expected = 'http://google.com/test.jpg';
      var target = processImageSrc(original, url);

      expect(target).to.equal(expected);
    });
  });

  describe('weight', function() {
    var original = [{src: 'test', weight:0}, {src: 'test2', weight:3}];
    it('should add weight the first item to 1', function() {
      var target = weight(original[0], 0);
      expect(target.weight).to.equal(1);
    });
    it('should not add 1 to the second item', function() {
      var target = weight(original[1], 1);
      expect(target.weight).to.equal(original[1].weight);
    });
  });
});
