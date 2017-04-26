angular.module('SnippetMain', []).controller('SnippetMain', function($scope, $http) {

	// View Model
	vm = this;

	// Search for Songs from Search Query
	vm.Search = function() {
	    var payload = {
	        searchQuery: vm.SearchQuery
	    };
        // POST Query to Snippet API
		$http.post('/api/spotify/search', payload)
			.then(function (resp) {
                // Assign VM Property Song Results to resulting JSON
				vm.SongResults = resp.data;
			});
	};
    
    vm.CreateTriggerEvent = function(){
        $('.list-group-item').click(function(){
            $('.collapse').collapse('hide');
            $(this).children('.collapse').collapse('show');
        }) 
    }
    
    vm.SearchUsers = function(){
        console.log(vm.FriendQuery);
    }

	$(function () {
        
        		
        // Initializing Full Page SPA (Single Page App Library)
		$('#fullpage').fullpage({
			sectionSelector: '.vertical-scrolling',
			slideSelector: '.horizontal-scrolling',
			controlArrows: false,
			slidesNavigation: true,
			scrollHorizontally: true,
			dragAndMove: true,
			verticalCentered: false
		});
        
        $(".friend-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.SearchUsers();
            }
        });
        
        $(".song-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.Search();
            }
        });
        
        // Loading Friend Streams on Initial Page Load
        $http.get('/api/user/getStreams')
			.then(function (resp) {
				vm.Streams = resp.data;
            
                $('.list-group-item').on('click', function() {
                    console.log('good')
                })
			});
		
        // Stop Other Player When New Player Selected
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