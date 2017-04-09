angular.module('SnippetLogin', []).controller('SnippetLogin', function($scope, $http) {

	vm = this;
	
	// Create Snippet User
	vm.createUser = function(){
		var req = {
			'username': vm.User.Email,
			'password': vm.User.Password,
			'name': vm.User.Name,
			'email': vm.User.Email
		};
		
		$http.post('/api/user/register', req)
			.then(function(res){
				/*
				var passport = require('passport')
  					, FacebookStrategy = require('passport-facebook').Strategy;

				passport.use(new FacebookStrategy({
				    clientID: FACEBOOK_APP_ID,
				    clientSecret: FACEBOOK_APP_SECRET,
				    callbackURL: "http://www.example.com/auth/facebook/callback"
				  },
				  function(accessToken, refreshToken, profile, done) {
				    User.findOrCreate(..., function(err, user) {
				      if (err) { return done(err); }
				      done(null, user);
				    });
				  }
				));
			*/
			});
	}
	
	// Login Snippet User
	vm.loginUser = function(){
		var req = {
			'username': vm.User.Email,
			'password': vm.User.Password
		}
		
		$http.post('/api/user/login', req)
			.then(function(res){
				// TO BE IMPLEMENTED
			});
		
	}


});