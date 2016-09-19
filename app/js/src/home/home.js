'use strict';

function HomeController($scope, $state, $timeout, $filter, NoteService, UtilityService)
{
    var vm      = this;

    vm.notes       = [];
    vm.notesCnt    = 0;
    vm.currentNote = {};
    vm.doPageSave  = true;

    //Destroy database
    // NoteService.destroyDb().then(function(response) {
    //     console.log('DB destroyed');
    // }, function(error) {
    //     console.log(error);
    // });

    vm.addNote = function() {
        var newNoteCnt = (vm.notes.length + 1);
        var newNote    = {
            _id        : UtilityService.getId(),
            type       : 'note',
            title      : 'New Note',
            isNewNote  : true,
            created_at : new Date().getTime(),
            pages      : []
        };

        vm.selectedNote = vm.notes.length;

        //Add to db
        NoteService.saveNote(newNote).then(function (response) {
            vm.notes.push(newNote);

            vm.currentNote = newNote;

            vm.currentNote.pages = [];
            vm.addPage();
        }, function(error) {
            console.log(error);
        });
    };

    vm.setCurrentNote = function(index, note) {
        vm.currentNote  = note;
        vm.selectedNote = index;
    };

    vm.getPages = function(index, note) {
        vm.currentNote  = note;
        vm.selectedNote = index;

        NoteService.getPages(vm.currentNote._id).then(function(response) {
            vm.currentNote.pages = response;

            if (vm.currentNote.pages)
            {
                var lastPage = vm.currentNote.pages[vm.currentNote.pages.length - 1];
                vm.setCurrentPage(0, lastPage);
            }
        }, function(error) {
            console.log(error);
        });
    };

    vm.setCurrentPage = function(index, page) {
        vm.doPageSave   = false;
        vm.currentPage  = page;
        vm.selectedPage = index;
    };

    vm.addPage = function() {
        var newPageCnt =  (vm.currentNote.pages.length + 1);
        var newPage = {
            _id        : UtilityService.getId(),
            note_id    : vm.currentNote._id,
            type       : 'page',
            title      : vm.currentNote.title + ' Page ' + newPageCnt,
            updated_at : new Date().getTime(),
            content    : 'This is content of page ' + newPageCnt
        };

        vm.selectedPage = 0;
        vm.currentNote.pages.push(newPage);

        vm.currentPage = newPage;
    };

    vm.saveCurrentNote = function() {
        NoteService.saveNote(vm.currentNote).then(function(response){

        }, function(err){

        });
    };

    vm.getNotes = function() {
        NoteService.getNotes().then(function(response) {
            vm.notes = response;

            //Default add one new note
            if (vm.notes.length === 0)
            {
               vm.addNote();
            }
            else
            {
                vm.setCurrentNote(0, vm.notes[0]);
                vm.getPages(0, vm.notes[0]);
            }
        }, function(error) {
            console.log(error);
        });
    };

    vm.getNotes();

    //Saving page
    var pageTimeout = null;
    var savePage = function() {
        vm.currentPage.updated_at = new Date().getTime();

        NoteService.savePage(vm.currentPage).then(function(response){
            console.log('Page Saved');
        }, function(err){
            console.log('Error Saving Page' + err);
        });
    };

    var debounceSavePage = function(newVal, oldVal) {
        if (newVal != oldVal && vm.doPageSave) {
            if (pageTimeout) {
                $timeout.cancel(pageTimeout);
            }

            pageTimeout = $timeout(savePage, 500);  // 1000 = 1 second
        }

        if (vm.currentPage)
        {
            //var pageContentElem = angular.element(document.querySelector('#page_content'));

            // var title = pageContentElem.text().trim();
            // title = (title.length < 15) ? title : title.substring(0, 15) + '...';

            // vm.currentPage.title = title;
        }

        vm.doPageSave = true;
    };

    $scope.$watch('vm.currentPage.content', debounceSavePage);
    //$scope.$watch('vm.currentNote.title', debounceSaveNote);

}

angular
    .module('notester')
    .controller('HomeController', HomeController);