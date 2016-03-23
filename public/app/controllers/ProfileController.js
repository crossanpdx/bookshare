angular.module('BookShare')
.controller('ProfileController', ['$scope', 'user', function($scope, user) {
  user.getUser().success(function(data) {
    $scope.user = data;
    // set the username
    var username = "You";
    if (data.twitter) {
        username = data.twitter.displayName;
    }
    else if (data.facebook) {
        username = data.facebook.displayName;
    }
    $scope.user.username = username;
    $scope.userLogout = function() {
      user.logoutUser();
    };
    $scope.formData = {};
    $scope.formData.fullName = data.fullName;
    $scope.formData.city = data.city;
    $scope.formData.state = data.state;
    $scope.formData.country = data.country;
    $scope.updateUser = function () {
      if ($scope.formData.fullName.match(/[^a-z\s0-9?]/ig)) {
        $scope.helpForm = 'Invalid Information. Please remove punctuation (valid characters are letters, numbers, spaces.)';
      } else if ($scope.formData.city && $scope.formData.city.match(/[^a-z\s0-9?]/ig)) {
        $scope.helpForm = 'Invalid Information. Please remove punctuation (valid characters are letters, numbers, spaces.)';
      } else if ($scope.formData.state && $scope.formData.state.match(/[^a-z\s0-9?]/ig)) {
        $scope.helpForm = 'Invalid Information. Please remove punctuation (valid characters are letters, numbers, spaces.)';
      } else if ($scope.formData.country && $scope.formData.country.match(/[^a-z\s0-9?]/ig)) {
        $scope.helpForm = 'Invalid Information. Please remove punctuation (valid characters are letters, numbers, spaces.)';
      } else if ($scope.formData.fullName == data.fullName && $scope.formData.city == data.city && $scope.formData.state == data.state && $scope.formData.country == data.country) {
        $scope.helpForm = 'Your information is up to date.';
      } else {
        var userData = $.param($scope.formData);
        user.updateUser(userData).success(function(data) {
          $scope.helpForm = data.message;
        });
      }
    };
  }); 
}]);