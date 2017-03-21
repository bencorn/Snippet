angular.module('SnippetMain', []).controller('SnippetMain', function($scope, $http) {

	vm = this;

	vm.Search = function(){
		console.log(vm.SearchQuery);
		payload = {searchQuery: vm.SearchQuery};
		$http.post('/api/spotify/search', payload)
			.then(function(resp){
				console.log(resp.data);
				vm.SongResults = resp.data;
			});
	}

});