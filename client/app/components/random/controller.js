'use strict';

angular.module('aleator.random', ['ui.router'])

.config(function($stateProvider) {
  $stateProvider
  .state('random', {
    url: "/random",
    templateUrl: "components/random/view.html",
    controller: 'aleator.random.controller'
  });

})

.controller('aleator.random.controller', ['$scope', '$http',
  function($scope, $http) {
    $scope.random = function() {
      $http.get('api/random').success(
        function(data, status, headers, config) {
          $scope.randomResult = data;
        }).error(function(data, status, headers, config) {
        $scope.randomResult = 'error';
      });
    };
  }
]);
