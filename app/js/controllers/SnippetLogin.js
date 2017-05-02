angular.module('SnippetLogin', []).controller('SnippetLogin', function($scope, $http) {

	vm = this;
	
	// Create Snippet User
	vm.createUser = function(){

		vm.errorMessage = false

		if(vm.User === undefined){
			vm.errorMessage = 'Please check if you filled out everything'
		}
		else{
			var req = {
				'username': vm.User.Name,
				'email': vm.User.Email,
				'password': vm.User.Password,
				'passwordCheck': vm.User.PasswordCheck
			}
			
			if(!(typeof vm.User.Name === 'string' && typeof vm.User.Email === 'string' && typeof vm.User.Password === 'string' && typeof vm.User.PasswordCheck === 'string')){
				vm.errorMessage = 'Please check if you filled out everything'
			}
			else{
				$http.post('/api/user/register', req)
					.then(function(res){
						if(res.data.success){
					    	window.location = res.data.location;
						}
						else{
							vm.errorMessage = res.data.message
						}
					});
			}
		}
	}
	
	// Login Snippet User
	vm.loginUser = function(){

		vm.errorMessage = false

		if(vm.User === undefined){
			vm.errorMessage = 'Please check if you filled out everything'
		}
		else{
			var req = {
				'email': vm.User.Email,
				'password': vm.User.Password
			}

			$http.post('/api/user/login', req)
				.then(function(res){
				    if(res.data.success){
				    	window.location = res.data.location;
					}
					else{
						vm.errorMessage = res.data.message
					}
				});	
		}
	}

	$(function () {

		$(".form-login .form-control").keyup(function(event){
            if(event.keyCode == 13){
                vm.loginUser();
            }
        })
        $(".form-register .form-control").keyup(function(event){
            if(event.keyCode == 13){
                vm.createUser();
            }
        })
	})
});