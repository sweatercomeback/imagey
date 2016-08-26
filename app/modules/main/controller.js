'use strict';
angular.module('app.main', [])
.controller('ImageFormController', function ($scope, $http) {
    $scope.url = '';
    $scope.images = [];
    $scope.pullImages = function(event) {
      console.log($scope.url);
      $http({
        method: 'POST',
        url: '/images',
        data: {url: $scope.url}
      }).then(function(res) {
              $scope.images = res.data;
            });
    };
});
