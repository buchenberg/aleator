'use strict';

angular.module('aleator.home', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
  .state('home', {
    url: "/home",
    templateUrl: "components/home/view.html",
    controller: 'aleator.home.controller'
  });

})

.controller('aleator.home.controller', ['$scope',
  function($scope) {
    $scope.message = 'Yo, World!';
  }
]);
