'use strict';

var app = angular.module('aleator', [
  'aleator.random',
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.cellNav',
  'ui.grid.edit',
  'ui.grid.pagination',
  'ngRoute'
]);

//configure our routes
app.config(function($routeProvider) {
  $routeProvider

  // route for the about page
    .when('/home', {
    templateUrl: 'components/home.html',
    controller: 'HomeCtl'
  })

  // route for the about page
  .when('/token', {
    templateUrl: 'components/tokens.html',
    controller: 'TokenCtl'
  })

});

app.controller('MainCtl', ['$scope', '$http',
  function($scope, $http) {



  }
]);


app.controller('TokenCtl', ['$scope', '$http',
  function($scope, $http) {


    $scope.gridOptions = {
      enableFiltering: true,
      columnDefs: [{
        name: 'id',
        field: 'hjid',
        displayName: 'Id',
        enableCellEdit: false,
        enableFiltering: false
      }, {
        name: 'word',
        displayName: 'Word',
        enableCellEdit: true
      }, {
        name: 'pos',
        displayName: 'Part of Speech',
        field: 'pos',
        enableCellEdit: false
      }, {
        name: 'edit',
        displayName: 'Actions',
        enableCellEdit: false,
        enableFiltering: false,
        enableSorting: false,
        width: 79,
        cellTemplate: '<div class="btn-group" role="group" aria-label="edit">' +
          '<button type="button" class="btn btn-danger" ng-click="getExternalScopes().deleteRow(row.entity.id)">' +
          '<i class="fi-trash"></i>' +
          ' Delete' +
          '</button>' +
          '</div>',
        headerCellTemplate: '<div></div>'

      }]
    };

    $scope.gridScope = {
      deleteRow: function(id) {
        //TODO stub
        alert(id);
      }
    };

    $http.get('/token').success(function(data) {
      $scope.gridOptions.data = data;
    });


  }
]);

// app.controller('RandomCtl', ['$scope', '$http',
//   function($scope, $http) {
//     $scope.random = function() {
//       $http.get('/random').success(
//         function(data, status, headers, config) {
//           $scope.randomResult = data;
//         }).error(function(data, status, headers, config) {
//         $scope.randomResult = 'error';
//       });
//     };
//   }
// ]);

app.controller('HomeCtl', ['$scope', '$http',
  function($scope, $http) {
    $scope.inputHandler = function() {
      $http.post('/input', $scope.input.text).success(
        function(data, status, headers, config) {
          $scope.result = data;
        }).error(function(data, status, headers, config) {
        $scope.result = 'error';
      });
    };
  }
]);
