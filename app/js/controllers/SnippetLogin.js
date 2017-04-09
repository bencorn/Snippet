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
				// TO BE IMPLEMENTED	
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