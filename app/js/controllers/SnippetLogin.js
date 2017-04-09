angular.module('SnippetLogin', []).controller('SnippetLogin', function($scope, $http) {

	vm = this;
	
	vm.createUser = function(){
		var req = {
			'username': vm.User.Email,
			'password': vm.User.Password,
			'name': vm.User.Name,
			'email': vm.User.Email
		};
		
		$http.post('/api/user/register', req)
			.then(function(res){
				
			});
	}


});