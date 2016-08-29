'use strict';
angular.module('app.main', [])
.controller('ImageFormController', function ($scope, $http) {
    $scope.url = '';
    $scope.images = [];
    $scope.loading = false;
    $scope.noResults = false;

    function sanitizeUrl(url) {
        if(url.startsWith('http')) {
          return url;
        } else if(url.startsWith('//')) {
          return 'http:'+url;
        }

        return "http://"+url;
    }

    $scope.pullImages = function(event) {
      $scope.loading = true;
      $scope.noResults = false;
      $scope.images = [];
      
      $scope.url = sanitizeUrl($scope.url);
      console.log($scope.url);
      $http({
        method: 'POST',
        url: '/images',
        data: {url: $scope.url}
      }).then(function(res) {
          $scope.images = res.data;
          $scope.noResults = res.data.length === 0;
        }).finally(function(){
          $scope.loading = false;
        });
    };
});
