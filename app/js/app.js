'use strict';


angular.module('notester', [
    'ui.router',
    'app.config'
]);

angular.module('notester')
    .controller('AppController', function ($scope, $state) {
        var vm = this;

        // angular.element(document.getElementsByTagName('html')).on('keyup', function(event){
        //     console.log(event.keyCode);
        // });
    });

angular.module('app.config', []);
