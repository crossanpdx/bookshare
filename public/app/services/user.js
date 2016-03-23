angular.module('BookShare')
.factory('user', ['$http', '$window', function($http, $window) {
  this.getUser = function() {
    return $http.get('/api/user')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // add book to library
  this.updateUser = function(data) {
    return $http({
            method  : 'POST',
            url     : '/api/user/update',
            data    : data, 
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
              .success(function(data) {
                return data;
              })
              .error(function(data) {
                return data;
              });
  };
  this.logoutUser = function() {
    return $http.get('/logout')
              .success(function(data) {
                $window.location.href = '/';
              })
              .error(function(err) {
                console.log(err);
                return err;
              });
  };
  return this;
}]);