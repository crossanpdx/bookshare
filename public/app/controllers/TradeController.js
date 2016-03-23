angular.module('BookShare')
.controller('TradeController', ['$scope', 'books', function($scope, books) {
    $scope.loading = true;
    $scope.myMatches = [];
    // GET A LIST OF BOOKS OWNED WITH REQUESTS
    books.myBooks().success(function(data) {
        for (var i = 0; i<data.length; i++) {
            if (data[i].traders.length > 0) {
                $scope.myMatches.push(data[i]);
            }
        }
    });
    // FUNCTIONS TO ACCEPT TRADES
    $scope.requestTrade = function(id) {
        for (var i = 0; i < $scope.myMatches.length; i++) {
            if ($scope.myMatches[i].book_id == id) {
                $scope.myMatches[i].acceptTrade = true;
            }
        }
    };
    $scope.cancelTrade = function(id) {
        for (var i = 0; i < $scope.myMatches.length; i++) {
            if ($scope.myMatches[i].book_id == id) {
                $scope.myMatches[i].acceptTrade = false;
            }
        }
    };
    // trade book
    $scope.tradeBook = function(bookID) {
        var deleteIndex =  function(index) {
            $scope.myMatches.splice(index, 1);
        };
        // send the book data to the back end
        books.tradeBook(bookID).success(function(data){
            $scope.message = data.message;
            // remove the book
            for (var i = 0; i < $scope.myMatches.length; i++) {
                if ($scope.myMatches[i].book_id == bookID) {
                    $scope.myMatches[i].acceptTrade = false;
                    deleteIndex(i);
                }
            }
        });
    };
    // GET A LIST OF ANY BOOKS THE USER REQUESTED
    books.myRequests().success(function(data) {
        $scope.loading = false;
        $scope.myRequests = data;
    });
    // FUNCTIONS TO DELETE REQUEST
    $scope.requestDelete = function(id) {
        for (var i = 0; i < $scope.myRequests.length; i++) {
            if ($scope.myRequests[i].book_id == id) {
                $scope.myRequests[i].deleteRequest = true;
            }
        }
    };
    $scope.cancelDelete = function(id) {
        for (var i = 0; i < $scope.myRequests.length; i++) {
            if ($scope.myRequests[i].book_id == id) {
                $scope.myRequests[i].deleteRequest = false;
            }
        }
    };
    // delete book from my books
    $scope.deleteBook = function(bookID) {
        var deleteIndex =  function(index) {
            $scope.myRequests.splice(index, 1);
        };
        // send the book data to the back end
        books.deleteRequest(bookID).success(function(data){
            $scope.message = data.message;
            // remove the book
            for (var i = 0; i < $scope.myRequests.length; i++) {
                if ($scope.myRequests[i].book_id == bookID) {
                    $scope.myRequests[i].deleteRequest = false;
                    deleteIndex(i);
                }
            }
        });
    };
}]);