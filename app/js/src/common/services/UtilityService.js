function UtilityService($http, $q)
{
    var utilityService = {};

    utilityService.getId = function(note) {
        var random = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return new Date().getTime() + random;
    };

    return utilityService;
}

angular
    .module('notester')
    .factory('UtilityService', UtilityService);