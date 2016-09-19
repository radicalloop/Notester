function PouchdbService()
{
    //Pouch.enableAllDbs = true;
    var pouchdb = new PouchDB('bd_notester', {adapter: 'websql', auto_compaction: true, revs_limit: 0});


    // Create index for notes
    pouchdb.createIndex({
        index: {
            name   : 'note_index',
            type   : 'note',
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
            name   : 'page_index',
            type   : 'page',
        }
    }).then(function (result) {
      // yo, a result
    }).catch(function (err) {
      // ouch, an error
    });

    return pouchdb;
}

angular
    .module('notester')
    .factory('pouchdb', PouchdbService);