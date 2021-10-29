(function () {
    'use static';

    function dashboardSettingsController($scope,
        notificationsService, uSyncPublishService,
        uSyncPublishServerManager, uSyncSettingManager) {

        var vm = this;
        vm.loading = true;

        vm.server = {};
        vm.settings = {};

        vm.saveState = 'init';

        vm.showAdvanced = true;
        vm.save = save;
        vm.reloadSettings = reloadSettings;
        vm.createKeys = createKeys;

        vm.copyText = copyText;

        vm.groups = [];

        vm.userGroupPicker = {};

        getSettings();

        /////////////////
        function save() {
            saveSettings();
        }

        var unsubscribe = [];

        unsubscribe.push($scope.$on('usync-publisher-settings-save', function () {
            saveSettings();
        }));

        unsubscribe.push($scope.$on('usync-publisher-settings-reload', function () {
            reloadSettings(true);
        }));

        $scope.$on('$destroy', function () {
            for (var u in unsubscribe) {
                unsubscribe[u]();
            }
        });


        /////////////////
        function getSettings() {

            uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.loading = false;
                    vm.settings = result.data;
                    vm.server = vm.settings.server;

                    initPicker();

                    if (!vm.settings.hasAppId) {
                        uSyncPublishServerManager.createLocalApiKeys();
                    }
                });


            // load all the publishers.
            uSyncPublishService.getPublishers()
                .then(function (result) {
                    vm.publishers = result.data;
                });

        }

        function reloadSettings(quite) {
            vm.loading = true;
            vm.saveState = 'busy';
            uSyncPublishService.reloadSettings()
                .then(function (result) {
                    vm.saveState = 'success';
                    vm.loading = false;
                    vm.settings = result.data;

                    initPicker();

                    if (!quite) {
                        notificationsService.add({
                            type: 'info',
                            headline: 'Reload',
                            message: 'Settings reloaded from disk'
                        });
                    }
                });
        }

        function saveSettings() {

            vm.saveState = 'busy';

            // put server settings back in
            vm.settings.server = vm.server;

            uSyncPublishService.saveSettings(vm.settings)
                .then(function (result) {
                    vm.saveState = 'success';
                    notificationsService.success('Save', 'uSync publisher settings saved');
                }, function (error) {
                    vm.saveState = 'error';
                    notificationsService.error('Error', error.data.ExceptionMessage);
                });
        }

        function copyText() {
            var copyItem = document.getElementById("serverUrl");
            copyItem.select();
            copyItem.setSelectionRange(0, 99999); /*For mobile devices*/
            document.execCommand("copy");
            notificationsService.success('Copied', 'Server url copied to clipboard');
        }

        function initPicker() {
            vm.userGroupPicker = {
                value: vm.server.sendSettings,
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'pickers/userGroupPicker.html',
                validation: {
                    mandatory: false
                },
                config: {}
            };

            if (vm.server.allowedServers === undefined || vm.server.allowedServers === null) {
                vm.settings.allowedServers = [];
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
            }
        }

        function createKeys() {
            uSyncPublishService.createKeys()
                .then(function (result) {
                    vm.saveState = 'success';
                    uSyncSettingManager
                        .showAppSettings('usyncpublish_securityKey',
                            'usyncpublish_createKeyIntro',
                            result.data.json);
                });
        }

        var unsubscribe = [];

        unsubscribe.push($scope.$watch('vm.publisher', function (newValue) {
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
        .controller('uSyncPublisherSettingsController', dashboardSettingsController);
})();