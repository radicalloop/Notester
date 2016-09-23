function PouchdbService()
{
    //Pouch.enableAllDbs = true;
    var pouchdb = new PouchDB('bd_notester', {adapter: 'websql', auto_compaction: true, revs_limit: 0});


    // Create index for notes
    pouchdb.createIndex({
        index: {
            fields : ['type'],
            name   : 'note_index'
        }
    }).then(function (result) {
      // yo, a result
    }).catch(function (err) {
      // ouch, an error
    });

    // Create index for notes
    pouchdb.createIndex({
        index: {
            fields : ['type'],
            name   : 'last_state_index'
        }
    }).then(function (result) {
      // yo, a result
    }).catch(function (err) {
      // ouch, an error
    });

    // Create index for pages
    pouchdb.createIndex({
        index: {
            fields : ['note_id', 'updated_at', 'type'],
            name   : 'page_index'
        }
    }).then(function (result) {
      // yo, a result
    }).catch(function (err) {
      // ouch, an error
    });

    pouchdb.createIndex({
        index: {
            fields : ['updated_at'],
            name   : 'updated_at_index'
        }
    }).then(function (result) {
      // yo, a result
    }).catch(function (err) {
      // ouch, an error
    });

    getAllIndexes = function() {
        pouchdb.getIndexes().then(function (result) {
            console.log(result);
        }).catch(function (err) {
          // ouch, an error
        });
    }

    deleteAllIndexes = function() {
        pouchdb.getIndexes().then(function (result) {
            for (index_result in result.indexes) {
                pouchdb.deleteIndex(result.indexes[index_result]).then(function (result) {
                    console.log(result);
                  // yo, a result
                }).catch(function (err) {
                  // ouch, an error
                });
            }
        }).catch(function (err) {
          // ouch, an error
        });
    }

    // TO DELETE ALL INDEXES, UNCOMMENT FOLLOWING LINE
    //deleteAllIndexes();

    // TO GET / VIEW ALL INDEXES, UNCOMMENT FOLLOWING LINE
    //getAllIndexes();

    PouchDB.debug.enable('pouchdb:find');

    return pouchdb;
}

angular
    .module('notester')
    .factory('pouchdb', PouchdbService);