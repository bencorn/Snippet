
//routes is the controller for the app, defining the routing for the website


//initialize mongoDB read & push
var db = require('../models/mongodb');
var Auth = require('../models/authentication');
var randomstring = require('randomstring');
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');

function initapp (app) {
	app.get('/', getHome);
	app.get('/register', getRegister);
	app.get('/login',getLogin);
	// app.get('/test', getTest);
	app.get('/auth/facebook',passport.authenticate('facebook'));
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {successRedirect: '/', failureRedirect:'/login'}));
    
    app.get('/api/user/getStreams', getStreams);
	app.get('/api/user/getStream', getStream);
	// app.post('/test', postTest);
	app.post('/api/spotify/search', spotifySearch);
	app.post('/api/user/register', registerUser);
	app.post('/api/user/login', loginUser);
	app.post('/api/user/addFriend', addFriend);
    app.post('/api/users/search', searchUsers);
	app.post('/api/user/addSongtoStream', addSongtoStream);
}

function verifyToken(token_string, callback) {
	// takes in the token string (stored in req.cookies.snippet) and returns boolean,data
	if(token_string === undefined || token_string.length == 0) {
		callback(true,{message:"Please sign in", error: 'token_string is undefined'})
	}
	else {
		Auth.decodeToken(token_string, function(err, decoded) {
			if(err || decoded === null || decoded.exp <= (Date.now())/ 1000){
				// token is not stale or valid, redirect to login
				callback(true,{message:"Please log in again", error:err})
			}
			else{
				// token is up to date, check if data valid
				User.findOne({email: decoded.email}, function (err, userdata) {
					if(err || userdata === null){
						// data invalid, redirect to login
						callback(true,{message:"User not found", error:err})
					}
					else{
						// data valid, send to index
						callback(false, userdata)
					}
				})
			}
		})

	}
}

function getUserEmail(token_string) {
    
		var promise = new Promise(function(resolve, reject){
            Auth.decodeToken(token_string, function(err, decoded) {
                if(err){
                    reject('Decode failure');
                }
                else{
                    // token is up to date, check if data valid
                    User.findOne({email: decoded.email}, function (err, userdata) {
                        if(err || userdata === null){
                            return '';
                        }
                        else{
                            // data valid, send to index
                            resolve(decoded.email);
                        }
                    })
                }
          })
    })
    
    return promise;
}

function spotifySearch(req, res){
console.log(req.body);
     var req_obj = req.body;
     var SpotifyWebApi = require('spotify-web-api-node');

	// credentials are optional
     var spotifyApi = new SpotifyWebApi();

spotifyApi.searchTracks(req_obj.searchQuery)
  .then(function(data) {
    res.json(data.body);
  }, function(err) {
	res.json('error');
  });

}

function loginUser(req, res){
	var email = req.body.username;
	var password = req.body.password;
	
	// Implement Login with Passport (Normal, Not Facebook)
		
	Auth.findOne({email:email}, function (err, authdata) {
		if (err || authdata === null){
			//email not found
			console.log("no email")
		}
		else{
			if (!authdata.validPassword(password)){
				//password invalid
				console.log("bad password")
			}
			else{
				//credentials OK, send jwt and log on
				newJWT = authdata.generateJwt()
				res.cookie('Snippet', newJWT)
				res.send('/')
			}
		}
	})
}

function registerUser(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username.split("@")[0];
	var password = req.body.password;
	
	var newUser = new User({
		username: username,
		email: email,
		name: name
		// friends: []
		// stream: []
	});

	newUser.save(function(err) {
		if(err) {
			// user has registered before
			console.log(err)
		}
		else {
			// new user, add auth token and pass to index
			var newAuth = new Auth({
				email: email,
				name: name
			})
			Auth.createToken(newAuth, password, function(err, token){
				if (!err) {
					newJWT = token.generateJwt()
					res.cookie('Snippet', newJWT)
					res.send('/')
				}
				else{
					console.log(err)
				}
			})
		}
	})
}

function getLogin(req, res){
	res.render("login.ejs");
}

function getRegister(req, res){
	res.render("register.ejs");
}

function getHome(req, res) {
	var token = req.cookies.Snippet
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.redirect('/login')
		}
		else{
			// token valid, send to index
			res.render('index')
		}
	})
}

function searchUsers(req, res){
	var token = req.cookies.Snippet
    var usernameQuery = req.body.username;
    // console.log(usernameQuery)
    if(usernameQuery.length < 3) {
    	res.json([])
    }
    else {
    	verifyToken(token, function(err, userdata) {
			if(err) {
				// invalid token, go to login
				res.json({error:'invalid token'})
			}
			else{
				// token valid, find friends
				if (req.body.username.includes("@")) {
			    	//search by email
			    	User.find({email:{ $regex: usernameQuery, $options: 'i' }}, function(err, users){
			            console.log(users)
			    		if (err){
			                // to do later
			            }
			            else{
			            	res.json(users.filter(function(u){
			            		return u.email !== userdata.email
			            	}))
			               
			            }
			    	})
			    }

			    else{
			    	//search by username
			    	User.find({username:{ $regex: usernameQuery, $options: 'i' }}, function(err, users){
			    		console.log(users)
			    		if (err){
			                // to do later
			            }
			            else{
			            	res.json(users.filter(function(u){
			            		return u.email !== userdata.email
			            	}))
			            }
			    	})
			    }
			}
		})
    }
}

function getStream(req, res) {
	var token = req.cookies.Snippet
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.redirect('/login')
		}
		else{
			// token valid, send stream
			var SpotifyWebApi = require('spotify-web-api-node')
			// credentials are optional
			var spotifyApi = new SpotifyWebApi();
			spotifyApi.getTracks(userdata.stream)
                .then(function(data) {
                	res.json(data.body);
                }, function(err) {
            }); 
		}
	})
}

function getStreams(req, res){
    
    getUserEmail(req.cookies['Snippet'])
        .then(function(email){
            User.findOne({email:email}, function (err, userData) {
            if (err){
                console.log("no email")
            }
            else{

                var userFriends = userData.friends.toObject();
                var friendStreams = [];
                var promiseArray = [];

                var SpotifyWebApi = require('spotify-web-api-node');

               // credentials are optional
                var spotifyApi = new SpotifyWebApi();

                for (var i = 0; i < userFriends.length; i++){

                    promiseArray.push(new Promise(function(resolve, reject){
                        User.findOne({email: userFriends[i]}, function(err, friendData){
                            if (err){
                                console.log("Error finding friend with email " + userFriends[i]);
                            }
                            else{                                                       
                                spotifyApi.getTracks(friendData.stream)
                                    .then(function(data) {
                                        var ind = i;
                                        friendData.stream = data.body;
                                        friendStreams.push(friendData.toObject());
                                        resolve('Data Fetched');
                                    
                                      }, function(err) {
                                        resolve('No Data Fetched')
                                      });   
                            }
                        })
                    }));
                }
                
                Promise.all(promiseArray)
                    .then(function(){
                        res.json(friendStreams); 
                });
            }
	}) 
})     
}

function addFriend(req, res) {
	var token = req.cookies.Snippet
	var req_friend = req.body.friend_username
	console.log(req_friend)
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.json({error:'invalid token'})
		}
		else{
			// token valid, update friends
			var email = userdata.email
			var new_friend = userdata.friends
			if (!new_friend.includes(req_friend)) {
				new_friend.push(req_friend)
			}
			User.findOneAndUpdate({email:email}, {friends: new_friend},  {upsert:false}, function(err, result){
				if (err){
					res.json({ error: err })
				}
				else{
					res.json({friends: result.friends})
				}
			})
		}
	})
}

function addSongtoStream(req, res) {
	var token = req.cookies.Snippet
	var req_song = req.body.song_id
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.json({error:'invalid token'})
		}
		else{
			// token valid, update user's stream
			var email = userdata.email
			var new_stream = userdata.stream
			if (!new_stream.includes(req_song)) {
				new_stream.push(req_song)
			}
			User.findOneAndUpdate({email:email}, {stream: new_stream}, {upsert:false}, function(err, result){
				if (err) {
					res.json({ error: err }) 
				}
				else {
					res.json({stream: result.stream})
				}
			})
		}
	})
}

// function getTest(req, res) {
// 	db.read('test', function(err,results){
// 		if(!err){
// 			res.render('test.ejs', {results: results})
// 		}
// 	})
// }

// function postTest(req, res) {
// 	db.write('test',req.body, function (err,results) {
// 		if (!err) {
// 			res.redirect('/')
// 		}
// 	})
// }

module.exports = initapp