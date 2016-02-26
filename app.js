angular.module('app', [])
	.constant('FIREBASE_URL', 'https://sizzling-fire-6500.firebaseio.com')
	.factory('MovieDataFactory', function($http, $q) {
		return {
			getMovies: function() {
				return $q(function(resolve, reject) {
					$http.get('movies.json')
						.then(function(res) {
							resolve(res.data);
						})
				});
			},

			getSeats: function() {
				return $q(function(resolve, reject) {
					$http.get('seats.json')
						.then(function(res) {
							resolve(res.data);
						});
				});
			}
		};
	})
	.controller('HomeController', function($scope, MovieDataFactory, FIREBASE_URL) {
		var reservationRef = new Firebase(FIREBASE_URL).child('reservations');

		$scope.movies = [];
		$scope.seats = [];
		$scope.currentMovie = {};

		$scope.reservations = [];

		reservationRef.on('value', function(snapshots) {
			$scope.reservations = [];

			snapshots.forEach(function(snapshot) {
				$scope.reservations.push(snapshot.val());
			});

			if (!$scope.movies.length) {
				initMovieData();
			}

			if (!$scope.$$phase) {
				$scope.$apply();
			}
		});

		function initMovieData() {
			MovieDataFactory.getMovies()
				.then(function(movies) {
					$scope.movies = movies;
					$scope.chooseMovie(movies[0]);
				});

			MovieDataFactory.getSeats()
				.then(function(seats) {
					$scope.seats = seats;
				});
		}

		$scope.chooseMovie = function(movie) {
			$scope.currentMovie = movie;
		}

		$scope.reserveSeat = function(seat) {
			if (!$scope.isReserved(seat)) {
				reservationRef.push($scope.currentMovie.id + seat);
			}
		}

		$scope.isReserved = function(seat) {
			var idx = $scope.reservations.indexOf($scope.currentMovie.id + seat);
			return idx>=0 ? true : false;
		}
	});