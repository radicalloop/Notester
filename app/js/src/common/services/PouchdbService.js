function PouchdbService()
{
    //Pouch.enableAllDbs = true;
    return new PouchDB('bd_notester', {adapter: 'websql', auto_compaction: true, revs_limit: 0});
}

angular
    .module('notester')
    .factory('pouchdb', PouchdbService);