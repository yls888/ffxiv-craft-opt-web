(function () {
    'use strict';

    angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('SimulatorController', controller);

    function controller($scope, $filter, $modal, $rootScope, $translate, $timeout, $state, _recipeLibrary, _simulator,
        _actionsByName, _bonusStats) {
        // Global page state
        angular.extend($scope.pageState, {});

        // Local page state
        $scope.logTabs = {
            monteCarlo: {
                active: true
            },
            probabilistic: {
                active: false
            },
            macro: {
                active: false
            }
        };
        $scope.saveRecipe = saveRecipe;
        $scope.loadRecipe = loadRecipe;

        //
        // SIMULATION
        //

        $scope.simulatorStatus = {
            monteCarlo: {
                logText: ''
            },
            probabilistic: {
                logText: ''
            },
            running: false,
            state: null,
            error: null,
            sequence: null,
            baseValues: null,
        };

        $scope.$on('simulation.needs.update', onSimulationNeedsUpdate);

        // Trigger simulation update when controller is initialized
        $scope.$broadcast('simulation.needs.update');

        //////////////////////////////////////////////////////////////////////////

        function onSimulationNeedsUpdate() {
            updateBaseValues();

            if ($scope.sequence.length > 0 && $scope.isValidSequence($scope.sequence, $scope.recipe.cls)) {
                runMonteCarloSim();
            } else {
                $scope.simulatorStatus.sequence = null;
                $scope.simulatorStatus.monteCarlo.logText = '';
                $scope.simulatorStatus.probabilistic.logText = '';
                $scope.simulatorStatus.state = null;
                $scope.simulatorStatus.error = null;
            }
        }

        function monteCarloSimSuccess(data) {
            $scope.simulatorStatus.sequence = data.sequence;
            $scope.simulatorStatus.monteCarlo.logText = data.log;
            $scope.simulatorStatus.state = data.state;
            $scope.simulatorStatus.error = null;

            runProbabilisticSim();
        }

        function monteCarloSimError(data) {
            $scope.simulatorStatus.sequence = data.sequence;
            $scope.simulatorStatus.monteCarlo.logText = data.log;
            $scope.simulatorStatus.monteCarlo.logText += '\n\nError: ' + data.error;
            $scope.simulatorStatus.state = null;
            $scope.simulatorStatus.error = data.error;
            $scope.simulatorStatus.running = false;
        }

        function runMonteCarloSim() {
            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: $scope.sequence,
                maxTricksUses: $scope.sequenceSettings.maxTricksUses,
                maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
                reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
                monteCarloMode: $scope.sequenceSettings.monteCarloMode,
                useConditions: $scope.sequenceSettings.useConditions,
                conditionalActionHandling: $scope.sequenceSettings.conditionalActionHandling,
                debug: $scope.sequenceSettings.debug
            };

            if ($scope.sequenceSettings.specifySeed) {
                settings.seed = $scope.sequenceSettings.seed;
            }

            $scope.simulatorStatus.running = true;
            _simulator.runMonteCarloSim(settings, monteCarloSimSuccess, monteCarloSimError);
        }

        function probabilisticSimSuccess(data) {
            $scope.simulatorStatus.probabilistic.logText = data.log;
            $scope.simulatorStatus.running = false;
        }

        function probabilisticSimError(data) {
            $scope.simulatorStatus.probabilistic.logText = data.log;
            $scope.simulatorStatus.probabilistic.logText += '\n\nError: ' + data.error;
            $scope.simulatorStatus.running = false;
        }

        function runProbabilisticSim() {
            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: $scope.sequence,
                maxTricksUses: $scope.sequenceSettings.maxTricksUses,
                maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
                reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
                useConditions: $scope.sequenceSettings.useConditions,
                //overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
                debug: $scope.sequenceSettings.debug,
            };

            $scope.simulatorStatus.running = true;
            _simulator.runProbabilisticSim(settings, probabilisticSimSuccess, probabilisticSimError);
        }

        function updateBaseValuesSuccess(data) {
            $scope.simulatorStatus.baseValues = data.baseValues;
        }

        function updateBaseValuesError(data) {
            $scope.simulatorStatus.baseValues = null;
        }

        function getCustomizedRecipeName() {
            var d = {
                "cn": "自定义配方",
                "de": "Customized",
                "en": "Customized",
                "fr": "Customized",
                "ja": "Customized",
                "ko": "Customized"
            };
            var key = window.localStorage.getItem("NG_TRANSLATE_LANG_KEY");
            return d[key];
        }

        function saveRecipe() {
            const useCustomeRecipe = document.getElementById('useCustomRecipe').checked;
            let theRecipe = null;
            if (!useCustomeRecipe) {
                theRecipe = $scope.recipe;
            } else {
                theRecipe = $scope.recipe;
                theRecipe.baseLevel = Number(document.getElementById('r-l').value);
                theRecipe.level = Number(document.getElementById('i-l').value);
                theRecipe.difficulty = Number(document.getElementById('dif').value);
                theRecipe.durability = Number(document.getElementById('dur').value);
                theRecipe.maxQuality = Number(document.getElementById('m-q').value);
                theRecipe.progressDivider = Number(document.getElementById('s-pd').value);
                theRecipe.qualityDivider = Number(document.getElementById('s-qd').value);
                theRecipe.progressModifier = Number(document.getElementById('s-epd').value);
                theRecipe.qualityModifier = Number(document.getElementById('s-eqd').value);
                theRecipe.id = "customizedRecipe";
                theRecipe.name = getCustomizedRecipeName();

                theRecipe.startQuality = 0;
                theRecipe.cls = $scope.recipe.cls;
                $scope.$emit('recipe.selected', theRecipe);
            }
            $scope.$broadcast('crafter.stats.changed');
            $scope.$broadcast('simulation.needs.update');
        }

        function loadRecipe() {
            var r = _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats);
            document.getElementById('r-l').value = r.baseLevel;
            document.getElementById('i-l').value = r.level;
            document.getElementById('dif').value = r.difficulty;
            document.getElementById('dur').value = r.durability;
            document.getElementById('m-q').value = r.maxQuality;
            document.getElementById('s-pd').value = r.progressDivider;
            document.getElementById('s-qd').value = r.qualityDivider;
            document.getElementById('s-epd').value = r.progressModifier;
            document.getElementById('s-eqd').value = r.qualityModifier;
        }

        function updateBaseValues() {
            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: $scope.sequence,
                maxTricksUses: $scope.sequenceSettings.maxTricksUses,
                maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
                reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
                useConditions: $scope.sequenceSettings.useConditions,
                //overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
                debug: $scope.sequenceSettings.debug,
            };
            _simulator.calculateBaseValues(settings, updateBaseValuesSuccess, updateBaseValuesError)
        }

        //
        // SEQUENCE EDITOR
        //

        $scope.sequenceActionClasses = sequenceActionClasses;
        $scope.editSequenceInline = editSequenceInline;

        $scope.editingSequence = false;

        $scope.$on('sequence.editor.close', onSequenceEditorClose);

        //////////////////////////////////////////////////////////////////////////

        function onSequenceEditorClose() {
            $scope.editingSequence = false;
        }

        function sequenceActionClasses(action, cls, index) {
            var wastedAction = $scope.simulatorStatus.state && (index + 1 > $scope.simulatorStatus.state.lastStep);
            var cpExceeded = wastedAction && _actionsByName[action].cpCost > $scope.simulatorStatus.state.cp;
            return {
                'faded-icon': !$scope.isActionSelected(action, cls),
                'wasted-action': wastedAction,
                'action-no-cp': cpExceeded
            };
        }

        function editSequenceInline() {
            $scope.editingSequence = true;
            $timeout(function () {
                $scope.$broadcast('sequence.editor.init', $scope.sequence, $scope.recipe,
                    $scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats, $scope.sequenceSettings);
            });
        }

        //
        // State Transitions
        //

        $scope.goToSolver = goToSolver;

        function goToSolver() {
            $state.go('solver', {
                autoStart: true
            });
        }
    }
})();
