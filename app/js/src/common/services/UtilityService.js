function UtilityService($http, $q)
{
    var utilityService = {};

    utilityService.getId = function(note) {
        return new Date().getTime() + '';
    };

    return utilityService;
}

angular
    .module('notester')
    .factory('UtilityService', UtilityService);