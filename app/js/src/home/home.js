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
    vm.addNote                   = addNote;
    vm.setCurrentNote            = setCurrentNote;
    vm.getPages                  = getPages;
    vm.addPage                   = addPage;
    vm.setCurrentPage            = setCurrentPage;
    vm.saveCurrentNote           = saveCurrentNote;
    vm.getNotes                  = getNotes;
    vm.getNoteCurrentState       = getNoteCurrentState;
    vm.checkPageExist            = checkPageExist;
    vm.currentActiveSection      = currentActiveSection;
    vm.searchPages               = searchPages;

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
                var lastPage = vm.currentNote.pages[vm.currentNote.pages.length - 1];
                vm.setCurrentPage(0, lastPage);
            }
        }
    }

    function _getPageById(page_id) {
        return $filter('filter')(vm.currentNote.pages, {_id: page_id})[0];
    }

    function _getPageIndex(page) {
        var pageIndex  = vm.currentNote.pages.indexOf(page);
        var finalIndex = (vm.currentNote.pages.length -1) - pageIndex;

        return finalIndex;
    }

    function setCurrentPage(index, page) {
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
    }

    function addPage() {
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

            vm.setCurrentNote(indexLastSelectedNote, lastSelectedNote);
            vm.getPages(indexLastSelectedNote, lastSelectedNote, vm.currentState.current_page);

            scrollToNote();

        }, function(error) {
            console.log(error);
        });
    }

    function scrollToNote() {
        document.getElementById(vm.currentNote._id).scrollIntoView();
    }

    function searchPages() {
        NoteService.searchPages(vm.searchTerm).then(function(response){
            console.log(response);

            vm.currentNote.pages = response;

        }, function(err){
            console.log('Error Searching ' + err);
        });
    }

    function checkPageExist() {
        if (!vm.currentNote.pages.length)
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

    //Watching delete events
    $scope.$on('click', function(onEvent, event) {
        vm.selectedSection = false;
    });

    $scope.$on('keydown', function(onEvent, event) {
        if (event.which === 8 || event.which === 46)
        {
            if (vm.selectedSection === 'page' || vm.selectedSection === 'note')
            {
                dialog.showMessageBox({
                   title: 'Title',
                   message: 'This is some descriptive message',
                   buttons: ['Cancel', 'OK'],
                   cancelId: 0,
                   defaultId: 1
                }, function(callback){
                   console.log(callback);
                });
            }
        }
    });
}

angular
    .module('notester')
    .controller('HomeController', HomeController);