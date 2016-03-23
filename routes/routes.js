var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: true });

var google = require('googleapis');
var books = google.books('v1');
require('dotenv').config();
 
var API_KEY = process.env.GOOGLE_KEY;

module.exports = function (app, db, passport) {
    
    // function to check if user is logged in
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
    
    // direct user to correct app if logged in or anon
    app.route('/')
        .get(function (request, response) {
    		if (request.isAuthenticated()) {
    			response.sendFile(process.cwd() + '/public/app/loggedin.html');
    		} else {
    			response.sendFile(process.cwd() + '/public/app/index.html');
    		}
            
        });
        
    // ANON APIS

        
    // LOGGED IN APIS
    // get user data
    app.route('/api/user')
        .get(isLoggedIn, function(req, res) {
			res.json(req.user);
        });
    // update user data from profile form
    app.route('/api/user/update')
        .post(isLoggedIn, parseUrlencoded, function(req, res) {
        	var userID = req.user._id;
        	db.collection('users').update({"_id": userID}, { $set: { "fullName": req.body.fullName, "city": req.body.city, "state": req.body.state, "country": req.body.country } }, function(err, update) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json({ "message": "Your profile has been updated." });
            	}
        	});
        });
    // get book data from search
    app.route('/api/book/search/:search')
        .get(isLoggedIn, function(req, res) {
			books.volumes.list({ auth: API_KEY, q: req.params.search, maxResults: 20 }, function(err, data) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json(data);
            	}
			});
        });
	// add book from post request full of book data
    app.route('/api/user/add/book')
        .post(isLoggedIn, parseUrlencoded, function(req, res) {
        	// get user id
        	var userID = req.user._id;
			// get the book data
			var bookID = req.body.id;
			var img = req.body.volumeInfo.imageLinks.thumbnail;
			var title = req.body.volumeInfo.title;
			var published = req.body.volumeInfo.publishedDate;
			var desc = req.body.volumeInfo.description;
			var rating = req.body.volumeInfo.averageRating;
			var ratingCount = req.body.volumeInfo.ratingsCount;
			// add or update the book in the library
            db.collection('library').update({ "book_id": bookID }, { $setOnInsert: { "book_id": bookID, "title": title, "img": img, "published_date": published, "description": desc }, $set: { "average_rating": rating, "rating_count": ratingCount }, $push: { "owners": userID }, $pull: { "traders": userID } }, { upsert: true, multi: false }, function(err, book) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add the activity to the user profile
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": userID}, { $pull: { "books_requested": bookID }, $push: { "books_owned": bookID, "activity": { $each: [{ "book": title, "type": "added a book to your library", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
            		res.json({"message": "You added " + title + " to your library"});
            	}
            });
        });
    // get list of book ids the user owns or requested
    app.route('/api/user/books/ids')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		db.collection('users').findOne({"_id": userID}, {"_id": 0, "books_owned": 1, "books_requested": 1}, function(err, books) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json(books);
            	}
    		});
    	});
    // get a detailed list of books the user owns
    app.route('/api/user/books/mybooks')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		db.collection('library').find({"owners": userID}).toArray(function(err, books) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json(books);
            	}
    		});
    	});
    // get a detailed list of books the user has requested
    app.route('/api/user/books/requests')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		db.collection('library').find({"traders": userID}).toArray(function(err, books) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json(books);
            	}
    		});
    	});
    // delete a book from the users library
    app.route('/api/user/delete/:bookid')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		var bookID = req.params.bookid;
    		// remove the user from the book owners
    		db.collection('library').findAndModify({ "book_id": bookID }, { "_id": 1 }, { $pull: { "owners": userID } }, { new: true }, function(err, book) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add the activity to the user profile
            		var title = book.value.title;
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": userID}, { $pull: { "books_owned": bookID }, $push: { "activity": { $each: [{ "book": title, "type": "removed a book from your library", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
            		res.json({"message": "You removed " + title + " from your library"});
            	}
    		});
    	});
    // request a book to trade
    app.route('/api/user/request/:bookid')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		var bookID = req.params.bookid;
    		// remove the user from the book owners
    		db.collection('library').findAndModify({ "book_id": bookID }, { "_id": 1 }, { $push: { "traders": userID } }, { new: true }, function(err, book) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add the activity to the user profile
            		var title = book.value.title;
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": userID}, { $push: { "books_requested": bookID, "activity": { $each: [{ "book": title, "type": "made a trade request", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
            		res.json({"message": "You requested " + title + " to trade"});
            	}
            });
    	});
    // delete a book from the users requests
    app.route('/api/user/requestdelete/:bookid')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		var bookID = req.params.bookid;
    		// remove the user from the book owners
    		db.collection('library').findAndModify({ "book_id": bookID }, { "_id": 1 }, { $pull: { "traders": userID } }, { new: true }, function(err, book) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add the activity to the user profile
            		var title = book.value.title;
                    var today = new Date;
                    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var month = months[today.getMonth()];
                    db.collection('users').update({"_id": userID}, { $pull: { "books_requested": bookID }, $push: { "activity": { $each: [{ "book": title, "type": "removed a book request", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
            		res.json({"message": "You removed " + title + " from your requests"});
            	}
    		});
    	});
    // accept a trade
    app.route('/api/user/trade/:bookid')
    	.get(isLoggedIn, function(req, res) {
    		var userID = req.user._id;
    		var bookID = req.params.bookid;
    		// remove the user from the book owners
    		db.collection('library').findAndModify({ "book_id": bookID }, { "_id": 1 }, { $pull: { "owners": userID } }, { new: true }, function(err, book) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		// add the new owner of the book from the first trader
            		var title = book.value.title;
            		var traderID = book.value.traders[0];
            		db.collection('library').update({ "book_id": bookID }, { $pull: { "traders": traderID }, $push: { "owners": traderID } }, { multi: false }, function (err, updated) {
                    	if (err) {
                    		console.log(err);
                    		res.status(400).json(err);
                    	} else {
                	        var today = new Date;
                            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                            var month = months[today.getMonth()];
                            // add the activity to the trader profile
                            db.collection('users').update({"_id": traderID}, { $pull: { "books_requested": bookID }, $push: { "books_owned": bookID, "activity": { $each: [{ "book": title, "type": "your book request has been accepted", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                    		// add the activity to the user profile
                            db.collection('users').update({"_id": userID}, { $pull: { "books_owned": bookID }, $inc: { "trade_credits": 1 }, $push: { "activity": { $each: [{ "book": title, "type": "traded your book", "date": month + " " + today.getDate() + ", " + today.getFullYear() }], $position: 0, $slice: 50 } } });
                    		res.json({"message": "You traded your book " + title});
                    	}
            		});
            	}
            });
    	});
    // get the full list of all books in the library owned by at least one person
    app.route('/api/book/all')
    	.get(isLoggedIn, function(req, res) {
    		db.collection('library').find({"owners.0": { $exists: true } }).toArray(function(err, books) {
            	if (err) {
            		console.log(err);
            		res.status(400).json(err);
            	} else {
            		res.json(books);
            	}
    		});
    	});
    

        
    // authentication routes (FIRST LOG IN)
        
	app.route('/auth/twitter')
		.get(passport.authenticate('twitter'));

	app.route('/auth/twitter/callback')
		.get(passport.authenticate('twitter', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	app.route('/auth/facebook')
	    .get(passport.authenticate('facebook'));
	    
	app.route('/auth/facebook/callback')
		.get(passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/'
		}));
		
	
	// authorize routes (CONNECT ADDITIONAL ACCOUNT)
	// put the logic in the above authentication routes, in future could have seperate strategy as per passport docs

	
	// LOG OUT
		
	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});
		
};