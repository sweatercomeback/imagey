'use strict';
angular.module('app.main', [])
.controller('ImageFormController', function ($scope, $http, $compile) {
    $scope.url = '';
    $scope.images = [];
    $scope.loading = false;
    $scope.noResults = false;
    $scope.hasLoaded = false;

    function sanitizeUrl(url) {
        if(url.startsWith('http')) {
          return url;
        } else if(url.startsWith('//')) {
          return 'http:'+url;
        }

        return "http://"+url;
    }

    function resetCarousel() {
      $(".carousel-container").html('');
    }

    $scope.addCarousel = function () {
      var el = $compile( "<carousel links='images'></carousel>" )( $scope );
      $(".carousel-container").append( el );
    };

    $scope.pullImages = function(event) {
      resetCarousel();
      $scope.loading = true;
      $scope.noResults = false;
      $scope.images = [];

      $scope.url = sanitizeUrl($scope.url);
      $http({
        method: 'POST',
        url: '/images',
        data: {url: $scope.url}
      }).then(function(res) {
          $scope.images = res.data;
          $scope.noResults = res.data.length === 0;
          $scope.hasResults = !$scope.noResults;
          if($scope.hasResults) {
            $scope.addCarousel();
          }
        }).finally(function(){
          $scope.loading = false;
        });
    };

    $scope.select = function() {
      $scope.images = [];
      $scope.url = '';
      $scope.noResults = false;
      $scope.hasResults = false;
      resetCarousel();
    }
});
