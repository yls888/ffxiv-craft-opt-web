(function () {
    'use strict';

    angular
    .module('ffxivCraftOptWeb.components')
    .directive('actionTable', factory);

    function factory() {
        return {
            restrict: 'E',
            templateUrl: 'components/action-table.html',
            scope: {
                cls: '=',
                onClick: '=',
                actionClasses: '=',
                selectable: '=',
                draggable: '=',
                tooltipPlacement: '@'
            },
            controller: controller
        }
    }

    function controller($scope, _actionGroups, _actionsByName, _tooltips, _getActionImagePath, _iActionClassSpecific) {
        $scope.actionGroups = _actionGroups;
        $scope.getActionImagePath = _getActionImagePath;
        $scope.cssClassesForAction = cssClassesForAction;
        $scope.actionForName = actionForName;
        $scope.iActionClassSpecific = _iActionClassSpecific;

        $scope.actionTooltips = {};
        $scope.effects = {}

        $scope.$on("tooltipCacheUpdated", updateActionTooltips);
        $scope.$watch("cls", updateActionTooltips);
        $scope.$on("allStatus", actionDisable);

        updateActionTooltips();

        //////////////////////////////////////////////////////////////////////////

        function updateActionTooltips() {
            var newTooltips = {};
            angular.forEach(_actionsByName, function (action) {
                var key;
                if (action.cls != 'All') {
                    key = action.cls + action.shortName;
                } else {
                    key = $scope.cls + action.shortName;
                }
                newTooltips[action.shortName] = _tooltips.actionTooltips[key];
            });
            $scope.actionTooltips = newTooltips;
        }

        function cssClassesForAction(name) {
            var classes = $scope.actionClasses(name, $scope.cls);
            classes['selectable'] = $scope.selectable;
            return classes;
        }

        function actionForName(name) {
            return _actionsByName[name];
        }

        function actionDisable(e, s) {
            $scope.effects = {}
            if (!s) return;
                
            if (!(s.effects.countUps && s.effects.countUps[AllActions.innerQuiet.shortName]) || s.effects.countUps[AllActions.innerQuiet.shortName] < 10) {
                $scope.effects.trainedFinesseNot = true
            }
            if ((AllActions.wasteNot.shortName in s.effects.countDowns) || (AllActions.wasteNot2.shortName in s.effects.countDowns)) {
                $scope.effects.wasteNot = true
            }
        }

        function isDisabled(action) {
            if (action === "trainedFinesse" && $scope.effects.trainedFinesseNot === true) {
                return true
            } else if ((action === "prudentSynthesis" || action === "prudentTouch") && $scope.effects.wasteNot === true) {
                return true
            } else {
                return false
            }
        }

        $scope.isDisabled = isDisabled
    }
})();
