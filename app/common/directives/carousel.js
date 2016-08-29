"use strict";

angular.module('app.main')
  .directive('carousel', function($timeout) {
   return {
      restrict: 'E',
      scope: {
        links: '='
      },
      templateUrl: './common/directives/carousel.html',
      link: function(scope, element) {
        $timeout(function() {
          $('.carousel-indicators li',element).first().addClass('active');
          $('.carousel-inner .item',element).first().addClass('active');
        });
      }
   }
});
