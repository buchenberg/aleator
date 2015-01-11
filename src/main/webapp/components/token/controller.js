'use strict';

angular.module('aleator.token', ['ui.router'])

.config(function($stateProvider) {

  $stateProvider
  .state('token', {
    url: "/token",
    templateUrl: "components/token/view.html",
    controller: 'aleator.token.controller'
  });

})

.controller('aleator.token.controller', ['$scope', '$http',
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

  $http.get('api/token').success(function(data) {
    $scope.gridOptions.data = data;
  });


}
  ]);
