(function () {
    'use strict';

    function langController($scope, uSyncActionManager) {
        var pvm = this;

        pvm.loading = true;
        pvm.all = true;

        pvm.process = $scope.vm.process;
        pvm.itemtype = 'content';

        pvm.mode = $scope.vm.mode;

        pvm.flags = $scope.vm.flags;
        pvm.server = pvm.process.server;

        if ($scope.model != null) {
            $scope.model.title = 'Select languages';
            $scope.model.subtitle = "Select Languages to publish to " + pvm.server.name;
        }

        pvm.variants = _.map($scope.vm.items[0].variants, function (name, id) {
            return {
                _checked: true,
                name: name,
                id: id
            }
        });

        pvm.loading = false;


        var watchEvent = $scope.$watch('pvm.variants', function (newValue) {
            if (newValue !== undefined) {
                pvm.process.options.cultures = [];
                $scope.vm.valid = false;

                for (let i = 0; i < newValue.length; i++) {
                    if (newValue[i]._checked === true) {
                        pvm.process.options.cultures.push(newValue[i].id);
                        $scope.vm.valid = true;
                    }
                }

                console.log(pvm.process.options.cultures.length, newvalue.length);

                if (pvm.process.options.cultures.length == newValue.length) {
                    // all selected
                    pvm.process.options.cultures = []
                    pvm.all = true;
                }
                else {
                    pvm.all = false;
                }

            }
        }, true);

        $scope.$on('$destroy', function () {
            watchEvent();
        })
    }

    angular.module('umbraco')
        .controller('uSyncPublisherLanguageController', langController);

})();