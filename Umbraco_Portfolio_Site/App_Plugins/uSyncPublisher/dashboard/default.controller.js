(function () {
    'use strict';

    function defaultController($rootScope, $q, $timeout,
        notificationsService, uSyncPublishService, uSyncPublishDialogManager) {

        var vm = this;
        vm.loading = true;
        vm.settings = {};
        vm.version = '';

        vm.addNew = addNew;
        vm.deploy = deploy;
        vm.gotoSettings = gotoSettings;

        vm.toggleValue = toggleValue;
        vm.copyText = copyText;

        vm.showHelp = showHelp;

        init();

        var e = [];

        e.push($rootScope.$on('usync-publish-server-delete', function () {
            init();
        }));

        e.push($rootScope.$on('usync-publish-server-sort', function () {
            init();
        }));

        /////
        function addNew() {
            uSyncPublishDialogManager.openNewServerDialog(null,
                function (saved) {
                    init();
                });
        }

        function gotoSettings(server) {
            uSyncPublishDialogManager.openServerDialog(server.alias,
                function (saved) {
                    init();
                });
        }

        function complete() {
            // callback for sync dialog.
        }

        /////
        function init() {
            vm.loading = true;
            var promises = [];

            promises.push(uSyncPublishService.getAllServers()
                .then(function (result) {
                    vm.servers = result.data;
                    checkServers(vm.servers);
                }));


            promises.push(uSyncPublishService.getSettings()
                .then(function (result) {
                    vm.settings = result.data;
                }));


            $q.all(promises).then(function () {
                vm.loading = false;
            });

            uSyncPublishService.getVersion()
                .then(function (result) {
                    vm.version = result.data;
                });
        }

        function checkServers(servers) {

            servers.forEach(function (server) {

                server._buttons = {
                    defaultButton: {
                        labelKey: 'usyncpublish_settings',
                        handler: function () { vm.gotoSettings(server); },
                    },
                    subButtons: []
                };

                uSyncPublishService.checkServer(server.alias)
                    .then(function (result) {
                        server.status = result.data;

                        if (server.status.enabled) {
                            server._buttons.subButtons = [
                                {
                                    labelKey: 'usyncpublish_deploy',
                                    handler: function () { deploy(server); }
                                },
                                {
                                    labelKey: 'usyncpublish_pullDeploy',
                                    handler: function () { pullDeploy(server); }
                                }];
                        }
                    });
            });
        }

        function deploy(server) {
            uSyncPublishDialogManager.openConfigDialog("Push", server.alias, function () { });
        }

        function pullDeploy(server) {
            uSyncPublishDialogManager.openConfigDialog("Pull", server.alias, function () { });
        }



        function toggleValue(value) {
            vm.settings[value] = !vm.settings[value];

            if (vm.time !== undefined && vm.time != null) {
                $timeout.cancel(vm.time);
            }

            // toggle but wait one second before saving (so you can toggle multiple things.)
            vm.time = $timeout(saveSettings, 1000);
        }

        function saveSettings() {
            uSyncPublishService.saveSettings(vm.settings)
                .then(function (result) {
                    notificationsService.success('Save', 'uSync publisher settings saved');
                }, function (error) {
                    notificationsService.error('Error', error.data.exceptionMessage);
                });
        }


        function copyText() {
            var range = document.createRange();
            range.selectNode(document.getElementById("serverUrl"));
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand("copy");
            window.getSelection().removeAllRanges();
            notificationsService.success('Copied', 'Server url copied to clipboard');
        }

        function showHelp(title, view) {
            vm.help = {
                title: title,
                subtitle: 'uSync publisher help',
                view: Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + '/help/' + view + ".html",
                show: true,
                hideSubmitButton: true,
                submit: function (model) {
                    vm.help = {};
                },
                close: function (model) {
                    vm.help = {};
                }
            }
        }

    }

    angular.module('umbraco')
        .controller('uSyncPublisherSettingsDefaultController', defaultController);
})();