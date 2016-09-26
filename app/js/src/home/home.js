'use strict';

const {dialog} = require('electron').remote;

function HomeController($scope, $state, $timeout, $window, $filter, NoteService, UtilityService)
{
    var vm             = this;

    vm.notes           = [];
    vm.notesCnt        = 0;
    vm.currentNote     = {};
    vm.currentState    = {};
    vm.doPageSave      = true;
    vm.selectedSection = 'note';
    vm.searchTerm      = '';

    //Functions
    vm.addNote              = addNote;
    vm.setCurrentNote       = setCurrentNote;
    vm.getPages             = getPages;
    vm.addPage              = addPage;
    vm.setCurrentPage       = setCurrentPage;
    vm.saveCurrentNote      = saveCurrentNote;
    vm.getNotes             = getNotes;
    vm.getNoteCurrentState  = getNoteCurrentState;
    vm.checkPageExist       = checkPageExist;
    vm.currentActiveSection = currentActiveSection;
    vm.searchPages          = searchPages;
    vm.deleteNoteOrPage     = deleteNoteOrPage;
    vm.printPage            = printPage;

    //Destroy database
    function _destroyDb() {
        NoteService.destroyDb().then(function(response) {
            console.log('DB destroyed');
        }, function(error) {
            console.log(error);
        });
    }

    //_destroyDb();

    //Initialize here.
    function init() {
        vm.getNotes();
    }

    init();

    function addNote() {
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
    }

    function setCurrentNote(index, note) {
        vm.currentNote  = note;
        vm.selectedNote = index;
    }

    function getPages(index, note, page_id) {
        vm.hideEditor  = false;
        vm.searchTerm  = '';

        vm.setCurrentNote(index, note);

        page_id = page_id || false;
        vm.selectedNote = index;

        NoteService.getPages(vm.currentNote._id).then(function(response) {
            _handlerGetPagesfunction(response, page_id);
        }, function(error) {
            console.log(error);
        });
    }

    function _handlerGetPagesfunction(response, page_id) {
        vm.currentNote.pages = response;

        if (vm.currentNote.pages)
        {
            var setDefaultPage = true;

            if (page_id)
            {
                var lastSelectedPage = _getPageById(page_id);
                if (lastSelectedPage)
                {
                    setDefaultPage = false;
                    var finalIndex = _getPageIndex(lastSelectedPage);

                    vm.setCurrentPage(finalIndex, lastSelectedPage);

                    $timeout(function(){
                       $scope.$broadcast('pagescroll_' + page_id);
                    });
                }
            }

            if (setDefaultPage)
            {
                var firstPage = vm.currentNote.pages[0];
                vm.setCurrentPage(0, firstPage);
            }
        }
    }

    function _getPageById(page_id) {
        return $filter('filter')(vm.currentNote.pages, {_id: page_id})[0];
    }

    function _getUnSavedPages() {
        return $filter('filter')(vm.currentNote.pages, {saved: false});
    }

    function _getPageIndex(page) {
        var finalIndex  = vm.currentNote.pages.indexOf(page);

        return finalIndex;
    }

    function _getNoteIndex(note) {
        var finalIndex  = vm.notes.indexOf(note);

        return finalIndex;
    }

    function _deleteUnsavedPages() {
        var unSavedPages = _getUnSavedPages();

        angular.forEach(unSavedPages, function(page) {
            var pageIndex = _getPageIndex(page);

            vm.currentNote.pages.splice(pageIndex, 1);
        });
    }

    function setCurrentPage(index, page) {
        if (vm.currentPage && false === vm.currentPage.saved && page !== vm.currentPage)
        {
            _deleteUnsavedPages();
        }

        vm.doPageSave   = false;
        vm.currentPage  = page;
        vm.selectedPage = _getPageIndex(page);

        vm.currentState._id          = (vm.currentState._id) ? vm.currentState._id : UtilityService.getId();
        vm.currentState.type         = 'last_state';
        vm.currentState.current_note = vm.currentNote._id;
        vm.currentState.current_page = (vm.currentPage && vm.currentPage._id) ? vm.currentPage._id : '';

        NoteService.updateNoteCurrentState(vm.currentState).then(function(response){
            vm.currentState._id = response.id;
        }, function(err){
            console.log(err);
        });
    }

    function addPage() {

        //If current page not saved not allow to add new page
        if (vm.currentPage && false === vm.currentPage.saved)
        {
            return false;
        }

        var newPage = {
            _id        : UtilityService.getId(),
            note_id    : vm.currentNote._id,
            type       : 'page',
            title      : 'New Page',
            updated_at : new Date().getTime(),
            content    : '',
            saved      : false
        };

        vm.selectedPage = 0;
        vm.currentNote.pages.unshift(newPage);

        vm.setCurrentPage(vm.selectedPage, newPage);
    }

    function saveCurrentNote() {
        NoteService.saveNote(vm.currentNote).then(function(response){

        }, function(err){

        });
    }

    function getNotes() {
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
    }

    function getNoteCurrentState() {
        NoteService.getNoteCurrentState().then(function(response) {
            vm.currentState = response;

            var lastSelectedNote      = $filter('filter')(vm.notes, {_id: vm.currentState.current_note})[0];
            var indexLastSelectedNote = vm.notes.indexOf(lastSelectedNote);

            if (indexLastSelectedNote >= 0)
            {
                vm.setCurrentNote(indexLastSelectedNote, lastSelectedNote);
                vm.getPages(indexLastSelectedNote, lastSelectedNote, vm.currentState.current_page);

                scrollToNote();
            }
            else
            {
                vm.setCurrentNote(0, vm.notes[0]);
                vm.getPages(0, vm.notes[0]);
            }
        }, function(error) {
            console.log(error);
        });
    }

    function scrollToNote() {
        document.getElementById(vm.currentNote._id).scrollIntoView();
    }

    function searchPages() {
        vm.hideEditor = false;

        if (vm.searchTerm)
        {
            NoteService.searchPages(vm.searchTerm).then(function(response){
                vm.currentNote.pages = response;

                if (response.length)
                {
                    var firstPage = vm.currentNote.pages[0];
                    vm.setCurrentPage(0, firstPage);
                }
                else
                {
                    vm.hideEditor = true;
                }
            }, function(err){
                console.log('Error Searching ' + err);
            });
        }
        else if (vm.notes.length)
        {
            var currentNoteIndex = _getNoteIndex(vm.currentNote);
            vm.getPages(currentNoteIndex, vm.currentNote);
        }
    }

    var searchTimeout = null;
    var debounceSearch = function(newVal, oldVal) {
        if (newVal != oldVal) {
            if (searchTimeout) {
                $timeout.cancel(searchTimeout);
            }

            searchTimeout = $timeout(searchPages, 500);  // 1000 = 1 second
        }
    };

    $scope.$watch('vm.searchTerm', debounceSearch);


    function checkPageExist() {
        if (vm.currentNote && !vm.currentNote.pages.length)
        {
            vm.addPage();
        }
        else
        {
            vm.currentActiveSection('editor');
        }
    }

    function currentActiveSection(section) {
        vm.selectedSection = section;
    }

    //Saving page
    var pageTimeout = null;
    var savePage = function() {
        if (vm.currentPage)
        {
            vm.currentPage.updated_at    = new Date().getTime();
            vm.currentPage.plain_content = vm.currentPage.content.replace(/(<([^>]+)>)/ig,"");

            delete vm.currentPage.saved;

            NoteService.savePage(vm.currentPage).then(function(response){
                console.log('Page Saved');
            }, function(err){
                console.log('Error Saving Page' + err);
            });
        }
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

    //Watching delete events
    $scope.$on('click', function(onEvent, event) {
        vm.selectedSection = false;
    });

    $scope.$on('keydown', function(onEvent, event) {
        if (event.which === 8 || event.which === 46)
        {
            deleteNoteOrPage();
        }
    });

    function deleteNoteOrPage() {
        if (vm.selectedSection === 'page')
        {
            dialog.showMessageBox({
                title     : 'Notester',
                message   : 'Are you sure you want to delete this Page?',
                buttons   : ['Cancel', 'OK'],
                cancelId  : 0,
                defaultId : 1
            }, function(response){

                if(response)
                {
                    var pageIndex = vm.selectedPage;

                    if (vm.currentPage && false === vm.currentPage.saved)
                    {
                        //Delete unsaved page and set to first index
                        _deleteUnsavedPages();

                        if (vm.currentNote.pages.length)
                        {
                            vm.setCurrentPage(0, vm.currentNote.pages[0]);
                        }
                    }
                    else
                    {
                        NoteService.deletePage(vm.currentPage).then(function(response) {

                            //delete vm.currentNote.pages[pageIndex];
                            vm.currentNote.pages.splice(pageIndex, 1);

                            if (vm.currentNote.pages.length)
                            {
                                var nextPageIndex = pageIndex;
                                var nextPage      = vm.currentNote.pages[nextPageIndex];

                                if (nextPage)
                                {
                                    vm.setCurrentPage(nextPageIndex, nextPage);
                                }
                                else if (vm.currentNote.pages.length)
                                {
                                    nextPageIndex = 0;
                                    nextPage      = vm.currentNote.pages[0];

                                    vm.setCurrentPage(nextPageIndex, nextPage);
                                }

                                vm.currentActiveSection('page');
                            }
                            else
                            {
                                delete vm.currentPage;
                            }
                        }, function(err) {
                            vm.currentNote.pages.splice(pageIndex, 1);

                            console.log(err);
                        });
                    }
                }
            });
        }
        else if(vm.selectedSection === 'note')
        {
            dialog.showMessageBox({
                title     : 'Notester',
                message   : 'Are you sure you want to delete this Note?',
                detail    : 'All pages of this Note will be deleted.',
                buttons   : ['Cancel', 'OK'],
                cancelId  : 0,
                defaultId : 1
            }, function(response){

                if(response)
                {
                    var noteIndex = vm.selectedNote;

                    NoteService.deleteNote(vm.currentNote).then(function(response) {

                        vm.notes.splice(noteIndex, 1);

                        if (vm.notes.length)
                        {
                            var nextNote = vm.notes[noteIndex];

                            if (!nextNote)
                            {
                                noteIndex = 0;
                                nextNote  = vm.notes[0];
                            }

                            vm.setCurrentNote(noteIndex, nextNote);
                            vm.getPages(noteIndex, nextNote);

                            vm.currentActiveSection('note');
                        }
                        else
                        {
                            vm.currentNote = false;
                        }

                    }, function(err) {
                        console.log(err);
                    });
                }
            });
        }
    }

    function printPage() {
        window.print();
    }
}

angular
    .module('notester')
    .controller('HomeController', HomeController);