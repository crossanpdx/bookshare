angular.module('BookShare')
.factory('books', ['$http', function($http) {
  // array of id's of books owned or requested for checking
  this.booksOwned = function() {
    return $http.get('/api/user/books/ids')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // get search results for book search term
  this.bookSearch = function(searchTerm) {
    return $http.get('/api/book/search/' + searchTerm)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // get full my books data
  this.myBooks = function() {
    return $http.get('/api/user/books/mybooks')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // get full my requests data
  this.myRequests = function() {
    return $http.get('/api/user/books/requests')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // get full all library owned books data
  this.allBooks = function() {
    return $http.get('/api/book/all')
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // add book to my books
  this.addBook = function(data) {
    return $http({
            method  : 'POST',
            url     : '/api/user/add/book',
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
  // delete book from my books
  this.deleteBook = function(bookID) {
    return $http.get('/api/user/delete/' + bookID)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // request book from library
  this.requestBook = function(bookID) {
    return $http.get('/api/user/request/' + bookID)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // delete book request from my trades
  this.deleteRequest = function(bookID) {
    return $http.get('/api/user/requestdelete/' + bookID)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  // trade book
  this.tradeBook = function(bookID) {
    return $http.get('/api/user/trade/' + bookID)
              .success(function(data) {
                return data;
              })
              .error(function(err) {
                return err;
              });
  };
  return this;
}]);