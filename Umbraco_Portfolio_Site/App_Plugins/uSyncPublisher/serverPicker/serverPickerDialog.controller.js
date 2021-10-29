(function () {
    'use strict';

    function serverPickerDialogController($scope, uSyncPublishService) {

        var vm = this;

        vm.loading = true; 
        vm.server = {};
        vm.selectedServer = null;

        vm.options = {
            alias: '',
            icon: '',
            push: true,
            pull: true,
            name: '',
        };

        vm.submit = submit;
        vm.close = close; 
        vm.select = select;
        vm.valid = valid;

        uSyncPublishService.getAllServers()
            .then(function (result) {
                vm.servers = result.data;
                vm.loading = false;
            });

        ////////////////

        function select(server) {
            vm.selectedServer = server;
            vm.options.alias = server.alias;
            vm.options.name = server.name;
            vm.options.icon = server.icon;
        }

        function submit() {
            if ($scope.model.submit) {
                $scope.model.submit(vm.options);
            }
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function valid() {

            if (vm.selectedServer === null) {
                return false;
            }

            if (vm.options.pull === false && vm.options.push === false) {
                return false;
            }

            return true;
        }
    }


    angular.module('umbraco')
        .controller('uSyncPublishServerpickerDialogController', serverPickerDialogController);


})();