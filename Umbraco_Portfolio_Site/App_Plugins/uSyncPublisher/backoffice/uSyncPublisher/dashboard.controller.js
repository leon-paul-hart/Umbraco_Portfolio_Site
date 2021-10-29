(function () {
    'use strict';

    function dashboardController($timeout, $rootScope, navigationService,
        uSyncPublishService, uSyncPublishServerManager) {

        var vm = this;
        vm.selectItem = selectItem;

        var title = 'uSync Publisher';
        var description = 'Send and Pull content from other Umbraco installs';

        vm.page = {
            title: title,
            description: description,
            version: Umbraco.Sys.ServerVariables.uSyncPublisher.dllVersion,
            navigation: [
                {
                    'name': 'Publisher',
                    'alias': 'publisher',
                    'icon': 'icon-truck',
                    'description': description,
                    'view': Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'dashboard/default.html',
                    'active': true
                },
                {
                    'name': 'Advanced',
                    'description': 'default settings used as a base for all servers in config',
                    'alias': 'settings',
                    'icon': 'icon-settings',
                    'view': Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'dashboard/settings.html',
                },
                {
                    'name': 'Cache',
                    'description': 'Caching dependencies and exports make publishing faster',
                    'alias': 'cache',
                    'icon': 'icon-flash',
                    'view': Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'dashboard/cache.html'
                },
                {
                    'name': 'Sync',
                    'description': 'Quickly get this install in sync with another server',
                    'alias': 'sync',
                    'icon': 'icon-infinity',
                    'view': Umbraco.Sys.ServerVariables.uSyncPublisher.pluginPath + 'dashboard/blank.html'
                }
            ]
        };

        // if site is blank, switch the active tab.
        // we are not doing this on v9 (for now), confuses to many people.
        //uSyncPublishService.hasContentOrMedia(true)
        //    .then(function (result) {
        //        if (!result.data) {
        //            vm.page.navigation[0].active = false;
        //            vm.page.navigation[vm.page.navigation.length - 1].active = true;
        //        }
        //    });


        $timeout(function () {
            navigationService.syncTree({ tree: 'uSyncPublisher', path: '-1' });
        });

        vm.save = saveSettings;
        vm.sync = syncSettings;

        function saveSettings() {
            $rootScope.$broadcast('usync-publisher-settings-save');
        }

        function selectItem(item) {
            vm.page.title = title;
            vm.page.description = item.description;

            if (item.name !== 'Publisher') {
                vm.page.title += ' - ' + item.name;
            }
        }

        function syncSettings() {
            uSyncPublishServerManager.syncSettings(function (success) {
                if (success) {

                }
                else {

                }
            });
        }
    }

    angular.module('umbraco')
        .controller('uSyncPublisherDashboardController', dashboardController);

})();