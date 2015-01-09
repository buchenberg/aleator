'use strict';

var app = angular.module('aleator', [ 'ui.bootstrap', 'ui.grid', 'ngRoute' ]);

//configure our routes
app.config(function($routeProvider) {
	$routeProvider
	
	// route for the about page
	.when('/home', {
		templateUrl : 'components/home.html',
		controller  : 'HomeCtl'
	})

	// route for the about page
	.when('/rand', {
		templateUrl : 'components/random.html',
		controller  : 'RandomCtl'
	})


	// route for the about page
	.when('/token', {
		templateUrl : 'components/tokens.html',
		controller  : 'TokenCtl'
	})

});

app.controller('MainCtl', 
		['$scope', '$http',
		function($scope, $http) {
			
			

			
} ]);


app.controller('TokenCtl', 
		['$scope', '$http',
		function($scope, $http) {
			$scope.message = 'Aboot!';
			$scope.gridOptions = {  };

			$scope.gridOptions.columnDefs = [ {
				name : 'id'
			}, {
				name: 'word'
			}, {
				name : 'pos'
			} ];

			$http.get('/token').success(function(data) {
				$scope.gridOptions.data = data;
			});
}]);

app.controller('RandomCtl', 
		['$scope', '$http',
		 function($scope, $http) {
			$scope.random = function() {
				$http.get('/random').success(
						function(data, status, headers, config) {
							$scope.randomResult = data;
						}).error(function(data, status, headers, config) {
							$scope.randomResult = 'error';
						});
			};
}]);

app.controller('HomeCtl', 
		['$scope', '$http',
		 function($scope, $http) {
			$scope.inputHandler = function() {
				$http.post('/input', $scope.input.text).success(
						function(data, status, headers, config) {
							$scope.result = data;
						}).error(function(data, status, headers, config) {
					$scope.result = 'error';
				});
			};
}]);
