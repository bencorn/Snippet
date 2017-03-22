angular.module('SnippetMain', []).controller('SnippetMain', function($scope, $http) {

	// View Model
	vm = this;

	// Search for Songs from Search Query
	vm.Search = function(){
	    payload = {
	        searchQuery: vm.SearchQuery
	    };
        // POST Query to Snippet API
		$http.post('/api/spotify/search', payload)
			.then(function (resp) {
                // Assign VM Property Song Results to resulting JSON
				vm.SongResults = resp.data;
			});
	}

	$(function () {
	    document.addEventListener('play', function (e) {
	        var audios = document.getElementsByTagName('audio');
	        for (var i = 0, len = audios.length; i < len; i++) {
	            if (audios[i] != e.target) {
	                audios[i].pause();
	            }
	        }
	    }, true);
	})
});