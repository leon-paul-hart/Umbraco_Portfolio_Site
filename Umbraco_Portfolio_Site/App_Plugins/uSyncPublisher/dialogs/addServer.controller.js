(function () {
    'use strict';

    function addServerController($rootScope, $scope, notificationsService,
        uSyncPublishService, uSyncPublishServerManager) {

        var vm = this;
        vm.loading = false;
        vm.selected = false;
        vm.checked = false;
        vm.showCheck = false;

        vm.dialog = {
            title: 'Add Server',
            description: 'Connect to a new server'
        };

        vm.server = {
            name: '',
            url: ''
        };

        vm.checkState = 'init';

        vm.close = close;
        vm.save = save;
        vm.select = select;

        vm.nameChange = nameChange;
        vm.urlChange = urlChange;

        vm.setupServer = setupServer;
        vm.checkServer = checkServer;

        init();

        function init() {
            getSettings();
            loadTemplates();
        }

        function getSettings() {
            uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;

                    if (!vm.settings.hasAppId) {
                        uSyncPublishServerManager.createLocalApiKeys();
                    }
                });
        }

        // template stuff 
        function loadTemplates() {
            uSyncPublishService.getTemplates()
                .then(function (result) {
                    vm.templates = result.data;
                }, function (error) {

                });
        }

        function select(template) {
            vm.templates.forEach(function (t) {
                t.selected = false;
            });

            template.selected = true;
            vm.selected = true;

            vm.server.icon = template.icon;
            vm.server.enabled = true;
            vm.server.pullEnabled = true;
            vm.server.sendSettings = template.flags;
            vm.server.publisher = template.publisher;
            vm.server.publisherConfig = template.publisherConfig
        }

        function urlChange() {
            vm.showCheck = false;
        }

        function nameChange() {
            if (vm.server.name != null) {
                vm.server.alias = vm.server.name.toUmbracoAlias();
            }
        }

        function checkServer() {
            if (vm.server.url == undefined) { return; }
            vm.checkState = 'busy';
            vm.server.url = vm.server.url.trimEnd('/');
            uSyncPublishServerManager.checkServerByUrl(vm.server.url,
                function (status) {
                    vm.status = status;
                    if (status.Status === 'Success') {
                        vm.checkState = 'success';
                    }
                    else {
                        vm.checkState = 'error';
                    }
                    vm.checked = true;
                    vm.showCheck = true;
                });
        }

        function setupServer() {
            uSyncPublishServerManager.remoteSetup(vm.server,
                function (success) {
                    if (success) {
                        checkServer();
                    }
                });
        }

        // dialog controls
        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function save() {
            uSyncPublishService.saveServer(vm.server)
                .then(function (result) {
                    vm.buttonState = 'success';
                    notificationsService.success('Saved', vm.server.alias + ' server settings have been updated');
                    $rootScope.$broadcast('usync-publish-serverSave');
                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService.error('error', error.data.exceptionMessage);
                });

            if ($scope.model.submit) {
                $scope.model.submit(vm.server);
            }
        }

    }

    angular.module('umbraco')
        .controller('uSyncAddServerController', addServerController);

})();