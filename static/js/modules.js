/* jshint browser:true, globalstrict:true */
/* global angular:true */
"use strict";

/////////////////////////
//// Library Modules ////

angular.module('jQuery', []).factory('$', function($window) { return $window.$.noConflict(true); });

angular.module('lodash', []).factory('_', function($window) { return $window._.noConflict(); });

angular.module('unisocket', []).factory('unisocket', function($window) { var u = $window.unisocket; delete $window.unisocket; return u; });

angular.module('d3', []).factory('d3', function($window) { return $window.d3; });
angular.module('dagreD3', ['d3']).factory('dagreD3', function($window) { return $window.dagreD3; });

angular.module('hljs', []).factory('hljs', function($window) { return $window.hljs; });

angular.module('ol', []).factory('ol', function($window) { return $window.ol; });

angular.module('moment', []).factory('moment', function($window) { return $window.moment; });


/////////////////////////////
//// Application Modules ////

angular.module('webPGQ', ['jQuery', 'hljs', 'lodash', 'ol', 'ngAnimate', 'ngCookies', 'openlayers-directive',
    'bgDirectives', 'ng-sortable', 'moment', 'webPGQ.directives', 'webPGQ.filters', 'webPGQ.services']);
angular.module('webPGQ.services', ['unisocket', 'd3', 'dagreD3', 'rt.eventemitter']);
angular.module('webPGQ.directives', ['ui.ace', 'hljs', 'RecursionHelper', 'webPGQ.services']);
angular.module('webPGQ.filters', []);
