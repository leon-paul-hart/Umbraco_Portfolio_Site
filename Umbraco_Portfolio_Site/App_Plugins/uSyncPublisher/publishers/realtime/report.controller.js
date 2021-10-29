(function () {
    'use strict';

    function reportController($scope) {

        // simple check to see if there are 
        // any changes that need to be made.

        var pvm = this;

        pvm.results = $scope.vm.report;
        pvm.showDetails = true;

        if ($scope.vm != null && $scope.vm.server != null) {
            var server = $scope.vm.server;
            $scope.vm.headings.boxTitle = server.name + ': Report';
            $scope.vm.headings.boxDescription = server.description + ' [' + server.url + ']';
        }

        $scope.vm.complete = !hasPending(pvm.results);
        $scope.vm.state.complete = $scope.vm.complete;
        $scope.vm.postActions = hasPostActions(pvm.results);
        // pvm.summary = getChangeSummary(pvm.results);

        pvm.toggleDetails = toggleDetails;

        function toggleDetails() {
            pvm.showDetails = !pvm.showDetails
        }

        function hasPending(results) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].change !== 'NoChange') {
                    return true;
                }
            }
            return false;
        }

        function hasPostActions(results) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].itemType.startsWith('Umbraco.Cms.Core.Models.IFile') && results[i].requiresPostProcessing) {
                    return true;
                }
            }

            return false;
        }

        function getChangeSummary(results) {

            var summary = {
                total: results.length,
                changes: 0,
                update: 0,
                create: 0,
                delete: 0
            };

            for (let c = 0; c < results.length; c++) {
                switch (results[c].change) {
                    case 'NoChange':
                        break;
                    case 'Update':
                        summary.update++;
                        break;
                    case 'Delete':
                        summary.delete++;
                        break;
                    case 'Create':
                        summary.create++;
                        break;
                }
            };

            summary.changes = summary.update + summary.delete + summary.create;

            return summary;
        }
         
    }

    angular.module('umbraco')
        .controller('uSyncPublisherReportController', reportController);
})();