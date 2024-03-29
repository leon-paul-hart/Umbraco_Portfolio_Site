﻿(function () {

    var syncOptionsComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncExporter/components/itemoptions.html',
        controllerAs: 'vm',
        controller: syncOptionsController,
        bindings: {
            options: '=',
            hideDecendants: '<',
            hideFiles: '<'
        }
    };

    function syncOptionsController() {
        var vm = this;
    }

    angular.module('umbraco')
        .component('usyncExportSyncOptions', syncOptionsComponent);


})();