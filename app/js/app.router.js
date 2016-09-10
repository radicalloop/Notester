'use strict';

angular.module('notester')
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(false).hashPrefix('!');
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                'main': {
                    templateUrl: 'js/src/home/home.tpl.html',
                    controller: 'HomeController',
                    controllerAs: 'vm'
                }
            }
        });

    $urlRouterProvider.otherwise('/');
});