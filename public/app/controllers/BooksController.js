angular.module('BookShare')
.controller('BooksController', ['$scope', 'books', function($scope, books) {
    $scope.loading = true;
    // GET A LIST OF ANY BOOKS THE USER OWNS
    books.myBooks().success(function(data) {
        $scope.loading = false;
        $scope.myBooks = data;
        if (!$scope.myBooks[0]) {
            $scope.message = "You have not added any books to your library yet";
        }
    });
    // FUNCTION TO SHORTEN DESCRIPTION
    $scope.descriptionLength = function(description) {
      if (description.length > 400) {
        return description.slice(0, 397) + "...";
      } else {
        return description;
      }
    };
    // FUNCTIONS TO DELETE BOOK
    $scope.requestDelete = function(id) {
        for (var i = 0; i < $scope.myBooks.length; i++) {
            if ($scope.myBooks[i].book_id == id) {
                $scope.myBooks[i].deleteRequest = true;
            }
        }
    };
    $scope.cancelDelete = function(id) {
        for (var i = 0; i < $scope.myBooks.length; i++) {
            if ($scope.myBooks[i].book_id == id) {
                $scope.myBooks[i].deleteRequest = false;
            }
        }
    };
    // delete book from my books
    $scope.deleteBook = function(bookID) {
        var deleteIndex =  function(index) {
            $scope.myBooks.splice(index, 1);
        };
        // send the book data to the back end
        books.deleteBook(bookID).success(function(data){
            $scope.message = data.message;
            // remove the book
            for (var i = 0; i < $scope.myBooks.length; i++) {
                if ($scope.myBooks[i].book_id == bookID) {
                    $scope.myBooks[i].deleteRequest = false;
                    deleteIndex(i);
                }
            }
        });
    };
}]);