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
                $('.song-results').perfectScrollbar('update');
			});
	};

    vm.getUserStream = function(){
        // Loading User Streams
	    $http.get('/api/user/getStream')
			.then(function (resp) {
				console.log(resp.data)
				vm.userStream = resp.data;
                $('.my-snippets').perfectScrollbar('update');
			})
    }
    
	// Add song to the user's stream
	vm.addSong = function(song_id) {
		console.log(song_id);
		var req = {song_id: song_id};
		// POST Query to Snippet API
		$http.post('/api/user/addSongtoStream', req)
			.then(function (result) {
				// Assign VM property Song results to resulting JSON
				vm.userStream = result.data;		
				vm.getUserStream()
				vm.getFriendsStreams()
			});
	};

	// remove song from the user's stream
	vm.removeSong = function(song_id) {
		console.log(song_id);
		var req = {song_id: song_id};
		// POST Query to Snippet API
		$http.post('/api/user/removeSongfromStream', req)
			.then(function (result) {
				// Assign VM property Song results to resulting JSON
				vm.userStream = result.data;
				vm.getUserStream()
				vm.getFriendsStreams()
			});
	}
	
    vm.CreateTriggerEvent = function(){
        $('.list-group-item').click(function(){
            $('.collapse').collapse('hide');
            $(this).children('.collapse').collapse('show');
        }) 
    }
    
    vm.SearchUsers = function(){
        var req = {username: vm.FriendQuery};
		// POST Query to Snippet API
		$http.post('/api/users/search', req)
			.then(function (result) {
				// Assign VM property Song results to resulting JSON
				vm.Users = result.data;
				vm.getFriendsStreams()
			});
    }
    
    vm.AddFriend = function(email){
        var req = {friend_username: email};
		// POST Query to Snippet API
		$http.post('/api/user/addFriend', req)
			.then(function (result) {
				// Assign VM property Song results to resulting JSON
				vm.Friends = result.data;
       	 		vm.getFriendsStreams()
			});
    }

    vm.getFriendsStreams = function() {
    	// Loading Friend Streams
    	$http.get('/api/user/getStreams')
			.then(function (resp) {
				vm.Streams = resp.data;
			});
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
        
        $(".song-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.Search();
            }
        });
        
        // Loading User Streams on Initial Page Load
        vm.getUserStream();
        // map search button to getStream
        $(".song-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.getUserStream()
            }
        });


        $(".friend-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.SearchUsers()
            }
        });
        
        // Loading Friend Streams on Initial Page Load
        vm.getFriendsStreams()
        // map search button to getFriendsStream
        $(".friend-search").keyup(function(event){
            if(event.keyCode == 13){
                vm.getFriendsStreams()
            }
        });
        
        $('.my-snippets').perfectScrollbar();
        $('.song-results').perfectScrollbar();

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