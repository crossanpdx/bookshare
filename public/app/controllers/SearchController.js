angular.module('BookShare')
.controller('SearchController', ['$scope', 'books', function($scope, books) {
    $scope.userOwns = [];
    // GET A LIST OF ANY BOOKS THE USER OWNS
    books.booksOwned().success(function(data) {
        for (var i = 0; i<data.books_owned; i++) {
            $scope.userOwns.push(data.books_owned[i]);
        }
    });
    // SEARCH FOR BOOKS BASED ON SEARCH TERMS
    $scope.bookSearch = function() {
        if (!$scope.bookTerms) {
            $scope.message = "You need to enter a book name or ISBN code to search.";
        } else {
            $scope.message = false;
            $scope.loading = true;
            books.bookSearch($scope.bookTerms).success(function(data) {
                $scope.bookItems = data.items;
                $scope.totalItems = data.totalItems;
                $scope.loading = false;
            }).error(function(error) {
                $scope.loading = false;
                $scope.message = "There was no data found for this book.";
            });
        }
    };
    // FUNCTION TO SHORTEN DESCRIPTION
    $scope.descriptionLength = function(description) {
      if (description.length > 400) {
        return description.slice(0, 397) + "...";
      } else {
        return description;
      }
    };
    // FUNCTION TO CHECK IF USER OWNS BOOK
    $scope.checkOwns = function(id) {
        if ($scope.userOwns) {
            for (var i = 0; i < $scope.userOwns.length; i++) {
                if ($scope.userOwns[i] == id) {
                    return true;
                }
            }
        }
        return false;
    };
    // FUNCTIONS TO ADD BOOK
    $scope.requestAdd = function(id) {
        for (var i = 0; i < $scope.bookItems.length; i++) {
            if ($scope.bookItems[i].id == id) {
                $scope.bookItems[i].addRequest = true;
            }
        }
    };
    $scope.cancelAdd = function(id) {
        for (var i = 0; i < $scope.bookItems.length; i++) {
            if ($scope.bookItems[i].id == id) {
                $scope.bookItems[i].addRequest = false;
            }
        }
    };
    // TO DO ADD BOOK TO MY BOOKS
    $scope.addBook = function(bookInfo) {
        var bookData = $.param(bookInfo);
        $scope.userOwns.push(bookInfo.id);
        $scope.addRequest = false;
        // send the book data to the back end
        books.addBook(bookData).success(function(data){
            $scope.message = data.message;
            // remove the addrequest from the book
            for (var i = 0; i < $scope.bookItems.length; i++) {
                if ($scope.bookItems[i].id == bookInfo.id) {
                    $scope.bookItems[i].addRequest = false;
                }
            }
        });
    };
}]);