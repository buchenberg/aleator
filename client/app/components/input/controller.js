'use strict';

angular.module('aleator.input', ['ui.router'])

.config(function($stateProvider) {
  $stateProvider
  .state('input', {
    url: "/input",
    templateUrl: "components/input/view.html",
    controller: 'aleator.input.controller'
  });
})

.controller('aleator.input.controller', ['$scope', '$http', 'appConfig',
  function($scope, $http, appConfig) {
    $scope.inputHandler = function() {
      $http.post(appConfig.apiUrl + 'input', $scope.input.text).success(
        function(data, status, headers, config) {
          $scope.result = data;
        }).error(function(data, status, headers, config) {
        $scope.result = 'error';
      });
    };
  }
]);
