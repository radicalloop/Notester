'use strict';

function HomeController($scope, $state, $timeout, $filter, NoteService, UtilityService)
{
    var vm      = this;

    vm.notes        = [];
    vm.notesCnt     = 0;
    vm.currentNote  = {};
    vm.currentState = {};
    vm.doPageSave   = true;

    //Destroy database
    // NoteService.destroyDb().then(function(response) {
    //     console.log('DB destroyed');
    // }, function(error) {
    //     console.log(error);
    // });
    document.onkeydown = function(e) {
        e = event.key;
        console.log(e);
    };
    
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

    vm.getPages = function(index, note, page_id) {

        vm.setCurrentNote(index, note);

        page_id = page_id || false;
        vm.selectedNote = index;

        NoteService.getPages(vm.currentNote._id).then(function(response) {
            vm.currentNote.pages = response;

            if (vm.currentNote.pages)
            {
                var setDefaultPage = true;

                if (page_id)
                {
                    var lastSelectedPage      = $filter('filter')(vm.currentNote.pages, {_id: page_id})[0];
                    if (lastSelectedPage)
                    {
                        setDefaultPage = false;

                        var indexLastSelectedPage = vm.currentNote.pages.indexOf(lastSelectedPage);
                        var finalIndex            = (vm.currentNote.pages.length -1) - indexLastSelectedPage;

                        vm.setCurrentPage(finalIndex, lastSelectedPage);
                    }
                }

                if (setDefaultPage)
                {
                    var lastPage = vm.currentNote.pages[vm.currentNote.pages.length - 1];
                    vm.setCurrentPage(0, lastPage);
                }
            }
        }, function(error) {
            console.log(error);
        });
    };

    vm.setCurrentPage = function(index, page) {
        vm.doPageSave   = false;
        vm.currentPage  = page;
        vm.selectedPage = index;

        vm.currentState._id          = (vm.currentState._id) ? vm.currentState._id : UtilityService.getId();
        vm.currentState.type         = 'last_state';
        vm.currentState.current_note = vm.currentNote._id;
        vm.currentState.current_page = (vm.currentPage && vm.currentPage._id) ? vm.currentPage._id : '';

        NoteService.updateNoteCurrentState(vm.currentState).then(function(response){
            vm.currentState._id = response.id;
        }, function(err){
            console.log(err);
        });
    };

    vm.addPage = function() {
        var newPageCnt =  (vm.currentNote.pages.length + 1);
        var newPage = {
            _id        : UtilityService.getId(),
            note_id    : vm.currentNote._id,
            type       : 'page',
            title      : 'New Page',
            updated_at : new Date().getTime(),
            content    : ''
        };

        vm.selectedPage = 0;
        vm.currentNote.pages.push(newPage);

        vm.setCurrentPage(0, newPage);
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
                vm.getNoteCurrentState();
            }
        }, function(error) {
            console.log(error);
        });
    };

    vm.getNotes();


    vm.getNoteCurrentState = function() {
        NoteService.getNoteCurrentState().then(function(response) {
            vm.currentState = response;

            var lastSelectedNote      = $filter('filter')(vm.notes, {_id: vm.currentState.current_note})[0];
            var indexLastSelectedNote = vm.notes.indexOf(lastSelectedNote);

            vm.setCurrentNote(indexLastSelectedNote, lastSelectedNote);
            vm.getPages(indexLastSelectedNote, lastSelectedNote, vm.currentState.current_page);

            //console.log('here');
            //console.log(vm.currentState);
        }, function(error) {
            console.log(error);
        });
    };

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

        vm.doPageSave = true;
    };

    $scope.$watch('vm.currentPage.content', debounceSavePage);
    //$scope.$watch('vm.currentNote.title', debounceSaveNote);

}

angular
    .module('notester')
    .controller('HomeController', HomeController);