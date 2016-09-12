var db = new PouchDB('bd_notester', {adapter: 'websql'});

function NoteService($http, $q)
{
    var noteService = {};

    noteService.getNotes = function() {

        return db.put({
          _id: 'mydoc',
          title: 'Heroes'
        }).then(function (response) {
            console.log(response);
          // handle response
        }).catch(function (err) {
          console.log(err);
        });

        // var deferred = $q.defer();

        // deferred.resolve('Get Notes..');

        // return deferred.promise;
    };

    return noteService;
}

angular
    .module('notester')
    .factory('NoteService', NoteService);