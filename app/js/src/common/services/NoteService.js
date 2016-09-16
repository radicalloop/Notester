function NoteService($http, $q, pouchdb, $rootScope)
{
    var noteService = {};

    noteService.getNotes = function() {

        var deferred = $q.defer();

        var map = function(doc) {
            if (doc.type === 'note') {
                emit(doc, null);
            }
        };

        pouchdb.query(map, {
            include_docs : true,
            reduce: false
        }).then(function (response) {

            var notes = response.rows.map(function(r) {
                var note = r.key;

                note.id        = note._id;
                note.editing   = 0;
                note.isNewNote = false;
                note.pages     = [];

                delete r.key;

                return note;
            });

            deferred.resolve(notes);
        }).catch(function (err) {
            deferred.reject(notes);
        });

        return deferred.promise;
    };

    noteService.destroyDb = function() {
        var deferred = $q.defer();

        pouchdb.destroy().then(function () {
            // database destroyed
            deferred.resolve({deleted: 1});
        }).catch(function (err) {
            // error occurred
            deferred.reject({deleted: 1});
        });

        return deferred.promise;
    };

    noteService.saveNote = function(note) {
        var deferred = $q.defer();

        pouchdb.put(note).then(function (response) {
            note._rev = response.rev;
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    noteService.savePage = function(page) {
        var deferred = $q.defer();

        pouchdb.put(page).then(function (response) {
            page._rev = response.rev;
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    // function onDatabaseChange(change) {
    //     console.log('changed-->');
    //     console.log(change);
    // };

    // pouchdb.changes({
    //     live: true, since: 'now', include_docs: true
    // }).on('change', onDatabaseChange);

    noteService.getPages = function(note_id) {
        var deferred = $q.defer();

        pouchdb.find({
            selector: {type: 'page', note_id: note_id},
        }).then(function (result) {

            var pages = result.docs.map(function(r) {
                return r;
            });

            deferred.resolve(pages);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };


    return noteService;
}

angular
    .module('notester')
    .factory('NoteService', NoteService);