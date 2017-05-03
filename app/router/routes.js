
//routes is the controller for the app, defining the routing for the website


//initialize mongoDB read & push
var db = require('../models/mongodb');
var Auth = require('../models/authentication');
var randomstring = require('randomstring');
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var validator = require('validator');
var config = require("../../config/config.json")

function initapp (app) {
	app.get('/', getHome);
	app.get('/register', getRegister);
	app.get('/login',getLogin);
	app.get('/logout',getLogout);
	app.get('/api/user/info',getUserInfo);
	// app.get('/test', getTest);
	app.get('/auth/facebook',passport.authenticate('facebook', { scope: ['email'] }));
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
			// Successful authentication, send token and route to home
				res.cookie('Snippet', req.user.jwt)
				res.redirect('/');
			});
	app.get('/api/user/getStreams', getStreams);
	app.get('/api/user/getStream', getStream);
	// app.post('/test', postTest);
	app.post('/api/spotify/search', spotifySearch);
	app.post('/api/user/register', registerUser);
	app.post('/api/user/login', loginUser);
	app.post('/api/user/addFriend', addFriend);
    app.post('/api/users/search', searchUsers);
	app.post('/api/user/addSongtoStream', addSongtoStream);
	app.post('/api/user/removeSongfromStream', removeSongfromStream);
}

var FACEBOOK_APP_ID = config.Facebook_App_ID
var FACEBOOK_APP_SECRET = config.Facebook_App_Secret
var FACEBOOK_APP_CALLBACK = config.Facebook_App_CallbackURL

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: FACEBOOK_APP_CALLBACK,
    profileFields: ['id', 'displayName', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
  	// done must return a user profile for verify ** cb(profile) **
    
    // attempt to find auth token
    Auth.findOne({email:profile._json.email}, function (err, authdata) {
    	
    	if (err || authdata === null){
    		//token not found, generate new token and user and return jwt in cb
    		var name = profile._json.name
			var email = profile._json.email
			var username = email.split('@')[0]
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
					done(err)
				}
				else {
					// new user, add auth token and pass to index
					var newAuth = new Auth({
						email: email,
						name: name,
						fb_authed: true
					})
					//generate random password
					var password = randomstring.generate(63);
					Auth.createToken(newAuth, password, function(err, token){
						if (!err) {
							newJWT = token.generateJwt()
							done(null,{jwt:newJWT})
						}
						else{
							//token encoutered error
							done(err)
						}
					})
				}
			})
    	}

    	else{
    		//token found, generate jwt and return in cb
    		newJWT = authdata.generateJwt()
			done(null,{jwt:newJWT})
    	}

    })
  }
));


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

	// Implement Login with Passport (Normal, Not Facebook)
	var email = req.body.email;
	var password = req.body.password;

	if(!(typeof email === 'string' && typeof password === 'string')){
			res.json({success:false, message:"Please check if you filled out everything"})
		}

	else{
		if (validator.isAlphanumeric(password) &&
			validator.isEmail(email) && 
			validator.isLength(password, {min:8, max:64})) {
			Auth.findOne({email:email}, function (err, authdata) {
				if (err || authdata === null){
					//email not found
					console.log("no email")
					res.json({success:false, message:"This email is not registered with Snippet"})
				}
				else{
					if (authdata.fb_authed) {
						//profile is set up with fb
						console.log("fb email")
						res.json({success:false, message:"This email is in use through Facebook"})

					}
					else{	
						if (!authdata.validPassword(password)){
							//password invalid
							console.log("bad password")
							res.json({success:false, message:"Incorrect Username/Password"})
						}
						else{
							//credentials OK, send jwt and log on
							newJWT = authdata.generateJwt()
							res.cookie('Snippet', newJWT)
							res.json({success:true, location:"/"})
						}
					}
				}
			})

		} else {
			//bad input
			res.json({success:false, message:"Incorrect Username/Password"})
		}
	}
}

function registerUser(req, res){
	var name = req.body.username;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var passwordCheck = req.body.passwordCheck;
	
	if(!(typeof username === 'string' && typeof email === 'string' && typeof password === 'string' && typeof passwordCheck === 'string')){
		res.json({success:false, message:"Please check if you filled out everything"})
	}
	else if (!validator.isEmail(email)){
		res.json({success:false, message:"This email is invalid"})
	}	
	else if (!validator.isAlphanumeric(username)) {
		res.json({success:false, message:"This username is invalid"})
	}
	else if (!validator.isAlphanumeric(password)) {
		res.json({success:false, message:"Password must only include alphanumeric characters"})
	}
	else if (!validator.isLength(password, {min:8, max:64})) {
		res.json({success:false, message:"Password must include 8 to 64 characters"})
	}
	else if (!validator.equals(password,passwordCheck)) {
		res.json({success:false, message:"Passwords do not match"})
	}
	else{

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
				res.json({success:false, message:"This email is already registered with Snippet"})
			}
			else {
				// new user, add auth token and pass to index
				var newAuth = new Auth({
					email: email,
					name: name,
					fb_authed: false
				})
				Auth.createToken(newAuth, password, function(err, token){
					if (!err) {
						newJWT = token.generateJwt()
						res.cookie('Snippet', newJWT)
						res.json({success:true, location:"/"})
					}
					else{
						//token encoutered error
						console.log(err)
						res.json({success:false, message:"Server has encountered an error, please try again later"})
					}
				})
			}
		})
	}
}


function getLogout(req, res){
	res.clearCookie("Snippet")
	res.redirect('/login')
}

function getLogin(req, res){
	// var token = req.cookies.Snippet
	// verifyToken(token, function(err, userdata) {
	// 	if(err) {
	// 		// token invalid, send to login
	// 		res.render('login.ejs')
	// 	}
	// 	else{
	// 		// valid token, go to index instead
	// 		res.redirect('/')
	// 	}
	// })
	res.render('login.ejs')

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
			res.render('index.ejs')
		}
	})
}

function getUserInfo(req, res) {
	var token = req.cookies.Snippet
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.json({error:'invalid token'})
		}
		else{
			// token valid, send userdata
			res.json(userdata)
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
				// token valid, find users
				if (req.body.username.includes("@")) {
			    	//search by email
			    	User.find({email:{ $regex: usernameQuery, $options: 'i' }}, function(err, users){
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
			    	//search by username or name
			    	User.find( {$or:[{name:{ $regex: usernameQuery, $options: 'i' }}, {username:{ $regex: usernameQuery, $options: 'i' }}]}, function(err, users){
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
                                      	// friendStreams.push(friendData.toObject());
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

function removeSongfromStream(req, res) {
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
			if (new_stream.includes(req_song)) {
				if(new_stream.length > 1){
					var i = new_stream.indexOf(req_song)
					new_stream.splice(i,1)	
				}
				else{
					//last element, clear the stream
					new_stream = []
				}
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