/* global angular: true, Blob: true */

angular.module('webPGQ.directives')
    .directive('saveFile', ['$sce', '$window', function($sce, $window)
    {
        function link(scope, element)//, attrs)
        {
            element.mouseenter(function()//event)
            {
                element.attr('href', 'data:application/x-sql;charset=utf-8;Content-Disposition:attachment,' +
                    encodeURIComponent(scope.ngModel));
            });
        } // end link

        return {
            restrict: 'E',
            scope: {
                ngModel: '=',
                fileName: '=',
                class: '@'
            },
            replace: true,
            link: link,
            templateUrl: '/js/directives/save-file.html'
        };
    }]);
