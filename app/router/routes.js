
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
	app.get('/api/user/getFriends', getFriends);
	app.get('/api/user/getStream', getStream);
	// app.post('/test', postTest);
	app.post('/api/spotify/search', spotifySearch);
	app.post('/api/user/register', registerUser);
	app.post('/api/user/login', loginUser);
	app.post('/api/user/addFriend', addFriend);
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

function getFriends(req, res) {
	var token = req.cookies.Snippet
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.redirect('/login')
		}
		else{
			// token valid, send friends
			res.json(userdata.friends)
		}
	})
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
			res.json(userdata.stream)
		}
	})
}

function getStreams(req, res){
    var streams = [
      {
          userId : 1,
          albumCover : 'http://www.billboard.com/files/styles/900_wide/public/media/Beyonce-Beyonce-greatest-album-covers-billboard-1000x1000.jpg',
          userName : 'Benjamin Corn',
          time : '33m ago',
          snippets : [
            {
                songId : '345435',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'https://static.gigwise.com/gallery/5209864_8262181_JasonDeruloTatGall.jpg',
                songTitle : 'Tat Gall',
                artistName : 'Jason Derulo'
            },
            {
                songId : '5675',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'http://www.fuse.tv/image/56fe73a1e05e186b2000009b/768/512/the-boxer-rebellion-ocean-by-ocean-album-cover-full-size.jpg',
                songTitle : 'Ocean',
                artistName : 'The Boxer Rebellion'
            },
            {
                songId : '65756',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'https://cdn.pastemagazine.com/www/system/images/photo_albums/album-covers/large/album4chanceacidrap.jpg?1384968217',
                songTitle : 'Acid Rap',
                artistName : 'Chance'
            }
          ]
      },
      {
          userId : 2,
          albumCover : 'http://illusion.scene360.com/wp-content/uploads/2014/10/computergraphics-album-covers-2014-15.jpg',
          userName : 'Ben Chen',
          time : '1hr ago',
          snippets : [
            {
                songId : '4565',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'http://androidjones.com/wp-content/uploads/2012/05/HOPE-1024x1024.jpg',
                songTitle : 'Hope',
                artistName : 'The Losers'
            },
            {
                songId : '223445',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'https://www.smashingmagazine.com/images/music-cd-covers/27.jpg',
                songTitle : 'Shrooms',
                artistName : 'The Growers'
            },
            {
                songId : '234234',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'https://cdn.pastemagazine.com/www/system/images/photo_albums/bestalbumcovers/large/tv-on-the-radio-happy-idiot-00.jpg?1384968217',
                songTitle : 'Mary Janes',
                artistName : 'The Smokers'
            }
          ]
      },
      {
          userId : 3,
          albumCover : 'https://imgix.ranker.com/node_img/101/2009619/original/sgt-pepper-s-lonely-hearts-club-band-albums-photo-1?w=650&q=50&fm=jpg',
          userName : 'Namir Fuzzy',
          time : '2hr ago',
          snippets : [
            {
                songId : '234234',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'https://s-media-cache-ak0.pinimg.com/736x/de/b5/8f/deb58ff0be3b4238ec3d1b4f96538627.jpg',
                songTitle : 'Shrubs',
                artistName : 'Bob Marley'
            },
            {
                songId : '23423',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'http://exclaim.ca/images/14worst.jpg',
                songTitle : 'Hope',
                artistName : 'The Umbrellas'
            },
            {
                songId : '234234',
                streamSrc : 'https://p.scdn.co/mp3-preview/1cb344e49f240ec1ae951c074f50fc9cb8c46216?cid=null',
                albumCover : 'http://cdn2.pitchfork.com/news/50138/021544fb.jpg',
                songTitle : 'Wolf',
                artistName : 'Tyler the Creator'
            }
          ]
      }
    ];
    
    res.json(streams);
}

function addFriend(req, res) {
	var token = req.cookies.Snippet
	var req_friend = req.body.friend_username
	verifyToken(token, function(err, userdata) {
		if(err) {
			// invalid token, go to login
			res.json({error:'invalid token'})
		}
		else{
			// token valid, update friends
			var email = userdata.email
			var new_friend = userdata.friends
			new_friend.push(req_friend)
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
			new_stream.push(req_song)
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