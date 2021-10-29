(function () {
    'use strict';

    function serverSettingsController($scope, $routeParams, $timeout, $http,
        $rootScope, navigationService, notificationsService, localizationService,
        uSyncPublishService, uSyncPublishDialogManager,
        uSyncPublishServerManager) {

        var vm = this;
        vm.loading = true;
        vm.checked = false;
        vm.showClose = false;
        vm.showAdvanced = true;
        vm.errorDesc = '';

        vm.selectItem = selectItem;

        var pluginPath = Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath;

        vm.page = {
            title: '[Server name]',
            description: '[Server description]',
            navigation: [
                {
                    'name': 'Server',
                    'alias': 'settings',
                    'icon': 'icon-server',
                    'description': 'Settings',
                    'view': pluginPath + 'server/settings.html',
                    'active': true
                },
                {
                    'name': 'Permissions',
                    'alias': 'permissions',
                    'icon': 'icon-combination-lock',
                    'description': 'a',
                    'view': pluginPath + 'server/permissions.html',
                },
                {
                    'name': 'Advanced',
                    'alias': 'advanced',
                    'icon': 'icon-settings-alt',
                    'description': 'b',
                    'view': pluginPath + 'server/advanced.html',
                }
            ]
        };

        function selectItem(item) {
            // load something on tab swap ?
        }

        vm.buttonState = 'init';
        vm.checkStatus = 'init';
        vm.checkStatusButton = 'Check access';

        vm.status = { enabled: false };
        vm.server = {
            id: '',
            sendSettings: { groups: ['admin','editor'] },
            icon: 'icon-server',
            allowedServers: []
        };


        vm.syncbuttons = {
            defaultButton: {
                labelKey: 'usyncpublish_deploy',
                handler: deploy
            },
            subButtons: [{
                labelKey: 'usyncpublish_pullDeploy',
                handler: pullDeploy
            }]
        };

        vm.save = save;
        vm.close = close;
        vm.checkServer = checkServer;
        vm.deploy = deploy;
        vm.pullDeploy = pullDeploy;

        vm.remoteSetup = remoteSetup;
        
        $timeout(function () {
            if (!vm.showClose) {
                navigationService.syncTree({ tree: "uSyncPublisher", path: vm.alias });
            }
        });
     
        Init();

        function Init() {

            getSettings();

            // load all the publishers.
            uSyncPublishService.getPublishers()
                .then(function (result) {
                    vm.publishers = result.data;
                });


            var serverAlias = $routeParams.id;
            if ($scope.model != null) {
                serverAlias = $scope.model.serverAlias;
                vm.showClose = true;
            }

            if (vm.alias !== serverAlias) {
                vm.alias = serverAlias;
                if (vm.alias !== '-1') {
                    loadServer();
                    return;
                }
            }
        }

        ////////////////

        function getSettings() {
            uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;

                    if (!vm.settings.hasAppId) {
                        uSyncPublishServerManager.createLocalApiKeys();
                    }
                });
        }


        function loadServer() {
            uSyncPublishService.getServer(vm.alias)
                .then(function (result) {
                    vm.server = result.data;

                    if (!vm.server) {
                        vm.server = {};
                    }

                    initPicker();
                    checkServer(false);

                    vm.loading = false;
                }, function (error) {
                    notificationsService.error('Error', error.data.ExceptionMessage);
                });
        }

        function initPicker() {

            if (vm.server.allowedServers === undefined || vm.server.allowedServers === null || vm.server.allowedServers.length === 0) {
                vm.server.allowedServers = [];
            }

            vm.allowedPicker = {
                value: vm.server.allowedServers,
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'serverPicker/picker.html',
                validation: {
                    mandatory: true
                },
                config: {
                    multiPicker: false
                }
            };

            vm.userGroupPicker = {
                value: vm.server.sendSettings,
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'pickers/userGroupPicker.html',
                validation: {
                    mandatory: false
                },
                config: {}
            };

        }

        function save()
        {
            vm.saved = false;
            vm.buttonState = 'busy';

            uSyncPublishService.saveServer(vm.server)
                .then(function (result) {
                    vm.buttonState = 'success';
                    notificationsService.success('Saved', vm.server.alias + ' server settings have been updated');
                    navigationService.syncTree({ tree: 'uSyncPublisher', path: ["-1", vm.server.alias], forceReload: true });
                    vm.saved = true;
                    vm.checked = false;
                    // event so sub setting views can act if they need to.
                    $rootScope.$broadcast('usync-publish-serverSave');
                    checkServer(false);
                    Init();

                }, function (error) {
                    vm.buttonState = 'error';
                    notificationsService.error('error', error.data.exceptionMessage);
                });
        }

        function close() {
            if ($scope.model.close) {
                $scope.model.close();
            }
        }

        function checkServer(showSuccessBar) {

            vm.checked = true;
            vm.checkStatus = 'busy';
            vm.status = {};

            uSyncPublishServerManager.checkServer(vm.server.alias, showSuccessBar,
                function (status) {
                    vm.status = status;
                    if (status != null) {
                        vm.checkStatus = 'success';
                        vm.checkStatusButton = status;
                        vm.saved = false;
                        $timeout(() => {
                            vm.checked = false;
                        }, 3500);
                    }
                    else {
                        getServerError(status);
                        vm.checkStatus = 'error';
                    }
                });
        }

        function getServerError(status) {

            console.log('getServerError', status);

            if (!status.enabled) {
                localizationService.localize("usyncpublish_error_" + status.status.toLowerCase())
                    .then(function (value) {
                        if (value.startsWith('[') && value.endsWith(']')) {
                            vm.errorDesc = status.status;
                        }
                        else {
                            vm.errorDesc = value;
                        }
                    });
            }
        }

        function deploy() {
            uSyncPublishDialogManager.openConfigDialog("Push", vm.server.alias, function () { });
        }

        function pullDeploy() {
            uSyncPublishDialogManager.openConfigDialog("Pull", vm.server.alias, function () { });
        }


        function remoteSetup(server) {
            uSyncPublishServerManager.remoteSetup(server, function (success) {
                checkServer(false);
                vm.checked = true;
            });
        }

        var unsubscribe = [];

        unsubscribe.push($scope.$watch('vm.server.Publisher', function (newValue) {
            if (newValue !== undefined) {

                var pub = _.find(vm.publishers, function (pub) { return pub.alias === newValue; });
                if (pub != null) {
                    vm.publisherDescription = pub.description;
                }
            }
        }));

        $scope.$on('$destroy', function () {
            for (var u in unsubscribe) {
                unsubscribe[u]();
            }
        });
    }

    angular.module('umbraco')
        .controller('uSyncPublisherServerSettingsController', serverSettingsController);
})();