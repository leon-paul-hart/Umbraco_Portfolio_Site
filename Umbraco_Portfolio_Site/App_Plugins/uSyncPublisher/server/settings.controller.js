(function () {
    'use strict';

    function settingsController($scope) {

        var vm = this;

        vm.model = $scope.model;
        vm.server = $scope.model.server;

        vm.allowedPicker = vm.model.allowedPicker;
        vm.userGroupPicker = vm.model.userGroupPicker;

        vm.hasContent = hasContent;
        vm.hasSettings = hasSettings;
        vm.hasFiles = hasFiles;

        vm.toggleContent = toggleContent;
        vm.toggleSettings = toggleSettings;
        vm.toggleFiles = toggleFiles;

        ////
        function hasContent() {
            return vm.server.sendSettings.includeChildren.indexOf('yes') != -1;
        }

        function hasSettings() {
            return vm.server.sendSettings.includeDependencies.indexOf('yes') != -1;
        }

        function hasFiles() {
            return vm.server.sendSettings.includeFiles.indexOf('yes') != -1;
        }

        function toggleContent() {
            if (vm.server.sendSettings.includeChildren.indexOf('yes') == -1) {

                vm.server.sendSettings.includeChildren = 'user-yes';
                vm.server.sendSettings.deleteMissing = 'user-yes';
                vm.server.sendSettings.includeMedia = 'yes';
            }
            else {
                vm.server.sendSettings.includeChildren = 'no';
                vm.server.sendSettings.deleteMissing = 'no';
                vm.server.sendSettings.includeMedia = 'no';
            }
        }

        function toggleSettings() {
            if (vm.server.sendSettings.includeDependencies.indexOf('yes') == -1) {
                vm.server.sendSettings.includeDependencies = 'yes';
                vm.server.sendSettings.includeConfig = 'yes';
            }
            else {
                vm.server.sendSettings.includeDependencies = 'no';
                vm.server.sendSettings.includeConfig = 'no';
            }
        }

        function toggleFiles() {
            if (vm.server.sendSettings.includeFiles.indexOf('yes') == -1) {
                vm.server.sendSettings.includeFiles = 'yes';
            }
            else {
                vm.server.sendSettings.includeFiles = 'no';
            }
        }
        
    }

    angular.module('umbraco')
        .controller('publisherServerSettingsController', settingsController);
})();