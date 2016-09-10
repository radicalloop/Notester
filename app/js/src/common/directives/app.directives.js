'use strict';

angular
    .module('notester')
    .directive('noteNaming', function($timeout) {
        return {
            restrict: 'EA',
            scope: {
                note: '=noteNaming',
                isNewNote: '='
            },
            template: [
                '<span ng-hide="note.editing">{{note.title}}</span>',
                '<input type="text" value="{note.title}" ng-hide="!note.editing" ng-model="note.title" name="note_title[]"  />'
            ].join(''),
            link : function (scope, element, attrs) {
                var input = angular.element(element[0].querySelector('input[name="note_title[]"]'));

                element.on('dblclick', function(){
                    $timeout(function() {
                        input[0].focus();
                        input[0].select();
                    });

                    scope.note.editing = 1;
                    scope.isNewNote    = false;

                    scope.$apply();
                });

                input.on('blur', function(){
                    scope.note.editing = 0;
                    scope.$apply();
                });

                input.on("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            scope.note.editing = 0;
                        });

                        event.preventDefault();
                    }
                });

                if (scope.isNewNote)
                {
                    $timeout(function(){
                        element.triggerHandler('dblclick');
                    });
                }
            }
        };
    })
    .directive('contenteditable', function () {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || '');
                };

                ngModel.$render();

                  // Listen for change events to enable binding
                element.on('blur keyup change', function () {
                    scope.$apply(readViewText);
                });

                // Write data to the model
                function readViewText() {
                    var html = element.html();
                      // When we clear the content editable the browser leaves a <br> behind
                      // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html == '<br>') {
                        html = '';
                    }

                    ngModel.$setViewValue(html);
                }
            }
        };
    });