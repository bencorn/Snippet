angular.module('snippetApp', ['SnippetMain', 'SnippetLogin', 'SnippetService'])
.filter('trustAudioSrc', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
});
