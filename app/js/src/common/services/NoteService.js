function NoteService($http, $q)
{
    var noteService = {};

    noteService.getNotes = function() {
        var deferred = $q.defer();

        deferred.resolve('Get Notes..');

        return deferred.promise;
    };

    return noteService;
}

angular
    .module('notester')
    .factory('NoteService', NoteService);