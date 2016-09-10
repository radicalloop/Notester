'use strict';

function HomeController($scope, $state, $timeout, NoteService) {
    var vm      = this;

    vm.notes       = [];
    vm.notesCnt    = 0;
    vm.currentNote = {};

    vm.addNote = function() {
        var newNoteCnt = (vm.notes.length + 1);
        var newNote    = {'id': 'note_' + newNoteCnt, title: 'Note ' + newNoteCnt, isNewNote: true};

        vm.selectedNote = vm.notes.length;

        vm.notes.push(newNote);

        vm.currentNote = newNote;

        vm.currentNote.pages = [];
        vm.addPage();
    };

    vm.getPages = function(index, note) {
        vm.currentNote  = note;
        vm.selectedNote = index;

        var firstPage = vm.currentNote.pages[0];
        vm.setCurrentPage(0, firstPage);
    };

    vm.setCurrentPage = function(index, page) {
        vm.currentPage  = page;
        vm.selectedPage = index;
    }

    vm.addPage = function() {
        var newPageCnt =  (vm.currentNote.pages.length + 1);
        var newPage = {'id': 'page_' + newPageCnt, title: vm.currentNote.title + ' Page ' + newPageCnt, updated_at: '31th Aug 2016 12:25pm', content: 'This is content of page ' + newPageCnt};

        vm.selectedPage = vm.currentNote.pages.length;
        vm.currentNote.pages.push(newPage);

        vm.currentPage = newPage;
    };

    NoteService.getNotes().then(function (response) {
        console.log(response);
    }, function(error) {
        console.log(error);
    });

    //Saving note
    var timeout = null;
    var saveUpdates = function() {
        console.log('Model saved...');
    };

    var debounceSaveUpdates = function(newVal, oldVal) {
        if (newVal != oldVal) {
            if (timeout) {
                $timeout.cancel(timeout)
            }

            timeout = $timeout(saveUpdates, 500);  // 1000 = 1 second
        }
    };

    $scope.$watch('vm.currentPage.content', debounceSaveUpdates);
    //$scope.$watch('myModel.field2', debounceSaveUpdates)

    //Default add one new note
    if (vm.notes.length === 0) {
        vm.addNote();
    }
}

angular
    .module('notester')
    .controller('HomeController', HomeController);