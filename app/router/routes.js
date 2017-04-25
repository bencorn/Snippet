
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
	// app.post('/test', postTest);
	app.post('/api/spotify/search', spotifySearch);
	app.post('/api/user/register', registerUser);
	app.post('/api/user/login', loginUser);
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
		if (!err){
			if (authdata.validPassword(password)){
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
	
	var newAuth = new Auth({
		email: email,
		name: name
	})

	Auth.createToken(newAuth, password, function(err, token){
		newJWT = token.generateJwt()
	})

	var newUser = new User({
		name: name,
		email: email,
		username: username,
		password: password
	});
	
	User.createUser(newUser, function(err, user){
		if (!err) {
			res.cookie('Snippet', newJWT)
			res.send('/')
		}
	});
};

function getLogin(req, res){
	res.render("login.ejs");
}

function getRegister(req, res){
	res.render("register.ejs");
}

function getHome(req, res) {
	var token = req.cookies.Snippet
	Auth.decodeToken(token, function(err, decoded) {
		if(err || decoded.exp <= (Date.now())/ 1000){
			// token is not stale or invalid, redirect to login
			res.redirect("/login");
		}
		else{
			// token is up to date and valid
			res.render("index.ejs")
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