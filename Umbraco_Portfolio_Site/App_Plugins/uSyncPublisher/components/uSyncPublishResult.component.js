(function () {

    'use strict';

    var publishResultComponent = {
        templateUrl: Umbraco.Sys.ServerVariables.application.applicationPath + 'App_Plugins/uSyncPublisher/components/uSyncPublishResult.html',
        bindings: {
            results: '<',
            total: '=',
            isModal: '<'
        },
        controllerAs: 'vm',
        controller: publishResultController
    };

    function publishResultController($scope, editorService) {

        var vm = this;

        // public methods
        vm.getTypeName = getTypeName;
        vm.showResult = showResult;
        vm.openDetail = openDetail;

        // public properties
        vm.groups = [];
        vm.total = 0;
        vm.noChangeList = '';

        // intialization
        vm.$onInit = function () {
            vm.groups = groupByType(vm.results);
            vm.total = totalChanges();
        };


        function openDetail(item) {

            if (!vm.isModal) {
                var options = {
                    item: item,
                    title: 'uSync Change',
                    view: Umbraco.Sys.ServerVariables.application.applicationPath + "App_Plugins/uSync/changedialog.html",
                    close: function () {
                        editorService.close();
                    }
                };
                editorService.open(options);
            }
            else {
                // if its model, we show the results inline. 
                item.show = !item.show;
            }
        }


        function getTypeName(typeName) {
            var umbType = typeName.substring(typeName.lastIndexOf('.') + 1);
            return umbType[0] == 'I' ? umbType.substring(1) : umbType;
        }

        function groupByType(results) {

            var groups = [];

            results.map(function (item) {
                var found = false;

                groups.map(function (group) {
                    if (group.type === item.itemType) {
                        group.items.push(item);
                        found = true;
                    }
                });

                if (!found) {
                    var newGroup = {
                        type: item.itemType,
                        name: getTypeName(item.itemType),
                        items: [],
                        showGroup: false
                    };
                        
                    newGroup.items.push(item);
                    groups.unshift(newGroup);
                }
            });

            for (let i = 0; i < groups.length; i++) {
                groups[i].itemCount = itemCount(groups[i].items);
                groups[i].changes = changeCount(groups[i].items);
            }

            if (groups.length > 0) {
                groups[0].showGroup = true;
            }

            return groups;
        }

        function itemCount(results) {

            var count = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i].change !== 'Clean') {
                    count++;
                }
            }
            return count;
        }

        function totalChanges() {
            var total = 0;
            var noChange = [];
            angular.forEach(vm.groups, function (group, key) {
                var changes = changeCount(group.items);
                total += changes;

                if (changes === 0) {
                    var item = group.name[group.name.length - 1] === 'e' ? group.name + 's' : group.name;
                    noChange.push(item + ' (' + group.items.length + ')');
                }
            });

            vm.noChangeList = noChange.join(', ');

            return total;
        }

        function changeCount(changes) {
            var count = 0;
            angular.forEach(changes, function (val, key) {
                if (val.change !== 'NoChange' && val.change !== 'Clean') {
                    count++;
                }
            });

            return count;
        }


        function showResult(result) {
            return result.change !== 'Clean' && result.change !== 'NoChange';
        }
    }

    angular.module('umbraco')
        .component('usyncPublishResultView', publishResultComponent);
})();