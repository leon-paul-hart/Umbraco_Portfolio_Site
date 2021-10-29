(function () {
    'use static';

    function syncSetupController($scope, uSyncPublishService) {

        var vm = this;
        vm.servers = [];

        vm.selectServer = selectServer;

        /// 
        uSyncPublishService.getAllServers()
            .then(function (result) {
                vm.servers = result.data;
                checkServers(vm.servers);
            });

        ///
        function checkServers(servers) {
            servers.forEach(function (server) {
                uSyncPublishService.checkServer(server.alias)
                    .then(function (result) {
                        server.status = result.data;
                        if (server.status.enabled === true) {
                            server.selected = true;
                            checkSelection();
                        }
                    });
            });
        }

        ///
        function selectServer(server) {
            if ($scope.model.busy) return;

            if (server.status === undefined || server.status.enabled !== true) {
                return;
            }

            server.selected = !server.selected;
            checkSelection();
        }


        function checkSelection() {

            $scope.model.servers = [];
            for (let s = 0; s < vm.servers.length; s++) {
                if (vm.servers[s].selected === true) {
                    $scope.model.servers.push(vm.servers[s].alias);
                }
            }

            if ($scope.model.servers.length > 0) {
                $scope.model.disableSubmitButton = false;
            }
            else {
                $scope.model.disableSubmitButton = true;
            }
        }
    }

    angular.module('umbraco')
        .controller('usyncSyncSetupController', syncSetupController);
})();