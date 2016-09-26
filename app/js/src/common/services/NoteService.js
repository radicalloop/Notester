function NoteService($http, $q, pouchdb, $rootScope)
{
    var noteService = {
        getNotes              : getNotes,
        destroyDb             : destroyDb,
        saveNote              : saveNote,
        savePage              : savePage,
        getPages              : getPages,
        updateNoteCurrentState: updateNoteCurrentState,
        getNoteCurrentState   : getNoteCurrentState,
        searchPages           : searchPages,
        deletePage            : deletePage,
        deleteNote            : deleteNote
    };

    function getNotes() {
        var deferred = $q.defer();

        pouchdb.find({
            selector: {type: 'note'},
        }).then(function (result) {
            var notes = result.docs.map(function(r) {
                var note = r;

                note.id        = note._id;
                note.editing   = 0;
                note.isNewNote = false;
                note.pages     = [];

                return note;
            });

            deferred.resolve(notes);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function destroyDb() {
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

    function saveNote(note) {
        var deferred = $q.defer();

        pouchdb.put(note).then(function (response) {
            note._rev = response.rev;
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function savePage(page) {

        var deferred = $q.defer();

        pouchdb.put(page).then(function (response) {
            page._rev = response.rev;
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    // function onDatabaseChange(change) {
    //     console.log('changed-->');
    //     console.log(change);
    // };

    // pouchdb.changes({
    //     live: true, since: 'now', include_docs: true
    // }).on('change', onDatabaseChange);

    function getPages(note_id) {
        var deferred = $q.defer();

        pouchdb.find({
            selector: {note_id: note_id, updated_at: {$gt: null}, type: 'page'},
            sort: [{updated_at: 'desc'}]
        }).then(function (result) {

            var pages = result.docs.map(function(r) {
                return r;
            });

            deferred.resolve(pages);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function updateNoteCurrentState(currentState) {
        var deferred = $q.defer();

        pouchdb.put(currentState).then(function (response) {
            currentState._rev = response.rev;
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function getNoteCurrentState(currentState) {
        var deferred = $q.defer();

        pouchdb.find({
            selector: {type: 'last_state'},
            //sort: [{'updated_at': 'desc'}]
        }).then(function (result) {
            // var lastState = result.docs.map(function(r) {
            //     return r;
            // });

            //console.log(result);

            var lastState = (result.docs.length) ? result.docs[0] : [];

            deferred.resolve(lastState);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function searchPages(searchTerm) {
        var deferred = $q.defer();

        var that        = this;
        that.searchTerm = searchTerm;

        pouchdb.query(searchMap, {
            //key     : searchTerm,
            //endkey  : searchTerm + '\uFFFF',
            include_docs : true
        }).then(function (result) {
            var results = result.rows.map(function(r) {
                 return r.doc;
            });

            deferred.resolve(results);

            // handle result
        }).catch(function (err) {
            // handle errors
            deferred.reject(err);
        });

        function searchMap(doc) {

            var isContentMatched = function(content, keyword) {
                var searchkey = keyword.trim().replace(/[$-\/?[-^{|}]/g, '\\$&');
                var regex     = new RegExp(searchkey,'i');

                return content.match(regex);
            }

            var docContent = doc.plain_content || false;

            if (docContent)
            {
                var keywords  = document.getElementById('search_term').value.trim().split(" ");

                var contentMatched = true;
                for(var k=0; k < keywords.length; k++)
                {
                    if (!isContentMatched(docContent, keywords[k]))
                    {
                        contentMatched = false;
                        break;
                    }
                }

                if (!contentMatched) {
                    var keyword = keywords.join("");

                    contentMatched = isContentMatched(docContent, keyword);
                }

                if (doc.type === 'page' && contentMatched) {
                    emit(docContent);
                }
            }


        }

        /*pouchdb.search({
            query       : searchTerm,
            fields      : ['content'],
            include_docs: true,
            filter      : function (doc) {
                return doc.type === 'page';
            }
        }).then(function (res) {

            var results = res.rows.map(function(r) {
                 return r.doc;
            });

            deferred.resolve(results);

        }).catch(function (err) {
            deferred.reject(err);
        });*/

        return deferred.promise;
    }

    function deletePage(currentPage){
        var deferred = $q.defer();

        pouchdb.remove(currentPage).then(function (response) {
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    function deleteNote(currentNote) {
        var deferred = $q.defer();

        var pages = currentNote.pages;
        
        //Delete all related pages first
        if (pages.length)
        {
            angular.forEach(pages, function(page) {
                deletePage(page);
            });
        }

        pouchdb.remove(currentNote).then(function (response) {
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    return noteService;
}

angular
    .module('notester')
    .factory('NoteService', NoteService);