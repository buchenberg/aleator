'use strict';

angular.module('aleator', [
    'ui.router',
    'mobile-angular-ui',
    'ui.grid',
    'ui.grid.cellNav',
    'ui.grid.edit',
    'ui.grid.pagination',
    'aleator.home',
    'aleator.random',
    'aleator.token',
    'aleator.input'
  ])
  .constant("appConfig", {
    "baseUrl": "http://localhost:8081"
  })

.config(function ($urlRouterProvider) {
  $urlRouterProvider.when('', '/home');
})

.controller('MainCtl', ['$scope', '$state',
  function ($scope, $state) {
    $scope.title = 'aleator';
    $scope.nav = [{
      'text': 'Home',
      'href': $state.href('home'),
      'class': 'active'
    }, {
      'text': 'Input',
      'href': $state.href('input'),
      'class': ''
    }, {
      'text': 'Tokens',
      'href': $state.href('token'),
      'class': ''
    }, {
      'text': 'Random',
      'href': $state.href('random'),
      'class': ''
    }];
  }
]);