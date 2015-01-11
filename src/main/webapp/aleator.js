'use strict';

var app = angular.module('aleator', [
  'ui.router',
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.cellNav',
  'ui.grid.edit',
  'ui.grid.pagination',
  'aleator.home',
  'aleator.random',
  'aleator.token',
  'aleator.input'
]);

app.controller('MainCtl', ['$scope', '$http',
  function($scope, $http) {
    //stub
  }
]);
