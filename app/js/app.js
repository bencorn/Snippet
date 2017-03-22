angular.module('snippetApp', ['SnippetMain', 'SnippetService'])
.filter('trustAudioSrc', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
});
