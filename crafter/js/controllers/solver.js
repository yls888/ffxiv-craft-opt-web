(function () {
    'use strict';

    angular
        .module('ffxivCraftOptWeb.controllers')
        .controller('SolverController', controller);

    function controller($scope, $state, $stateParams, _solver, _simulator, _bonusStats) {
        // Global page state
        if (!$scope.pageState.solverStatus) {
            angular.extend($scope.pageState, {
                solverStatus: {
                    running: false,
                    generationsCompleted: 0,
                    maxGenerations: 0,
                    state: null,
                    logs: {
                        execution: '',
                        ga: '',
                        mc: ''
                    },
                    sequence: [],
                    error: null
                }
            });
        }

        // Local page state
        $scope.logTabs = {
            execution: {
                active: false
            },
            ga: {
                active: false
            },
            mc: {
                active: true
            },
            macro: {
                active: false
            }
        };

        //
        // SOLVER
        //

        $scope.startSolver = startSolver;
        $scope.resetSolver = resetSolver;
        $scope.resumeSolver = resumeSolver;
        $scope.stopSolver = stopSolver;
        $scope.useSolverResult = useSolverResult;
        $scope.equivalentSequence = equivalentSequence;
        $scope.sequenceActionClasses = sequenceActionClasses;
        $scope.saveRecipe = saveRecipe;
        $scope.loadRecipe = loadRecipe;

        $scope.$on('synth.changed', resetSolver);

        //
        // State Parameter Handling
        //

        if ($stateParams.autoStart) {
            resetSolver();
            startSolver();
        }

        //////////////////////////////////////////////////////////////////////////

        function sequenceActionClasses(action, cls, index) {
            return {
                'faded-icon': !$scope.isActionSelected(action, cls),
            };
        }

        function probabilisticSimSuccess(data) {
            $scope.pageState.solverStatus.logs.ga = data.log;
        }

        function probabilisticSimError(data) {
            $scope.pageState.solverStatus.logs.ga = data.log;
        }

        function runProbabilisticSim(sequence) {
            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: sequence,
                maxTricksUses: $scope.sequenceSettings.maxTricksUses,
                maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
                reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
                useConditions: $scope.sequenceSettings.useConditions,
                //overrideOnCondition: $scope.sequenceSettings.overrideOnCondition,
                debug: $scope.sequenceSettings.debug
            };

            _simulator.runProbabilisticSim(settings, probabilisticSimSuccess, probabilisticSimError);
        }

        function monteCarloSimSuccess(data) {
            $scope.pageState.solverStatus.error = null;
            $scope.pageState.solverStatus.state = data.state;
            $scope.pageState.solverStatus.logs.mc = data.log;

            runProbabilisticSim(data.sequence);
        }

        function monteCarloSimError(data) {
            $scope.pageState.solverStatus.error = data.error;
            $scope.pageState.solverStatus.state = null;
            $scope.pageState.solverStatus.logs.mc = data.log;
        }

        function runMonteCarloSim(sequence) {
            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: sequence,
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

            _simulator.runMonteCarloSim(settings, monteCarloSimSuccess, monteCarloSimError);
        }

        function solverProgress(data) {
            $scope.pageState.solverStatus.generationsCompleted = data.generationsCompleted;
            $scope.pageState.solverStatus.maxGenerations = data.maxGenerations;
            $scope.pageState.solverStatus.error = null;
            $scope.pageState.solverStatus.state = data.state;
            $scope.pageState.solverStatus.sequence = data.bestSequence;
        }

        function solverSuccess(data) {
            $scope.pageState.solverStatus.running = false;
            $scope.pageState.solverStatus.error = null;
            $scope.pageState.solverStatus.logs.execution = data.executionLog;
            $scope.pageState.solverStatus.sequence = data.bestSequence;

            runMonteCarloSim(data.bestSequence);
        }

        function solverError(data) {
            $scope.pageState.solverStatus.running = false;

            $scope.pageState.solverStatus.error = data.error;
            $scope.pageState.solverStatus.state = data.state;
            $scope.pageState.solverStatus.logs.execution = data.executionLog;
            $scope.pageState.solverStatus.sequence = [];
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
                theRecipe.safetyMargin = 0;
                theRecipe.cls = $scope.recipe.cls;
                $scope.$emit('recipe.selected', theRecipe);
            }
            $scope.$broadcast('crafter.stats.changed');
            $scope.$broadcast('simulation.needs.update');
        }

        function startSolver() {
            var sequence = $scope.pageState.solverStatus.sequence;
            if (sequence.length === 0)
                sequence = $scope.sequence;

            var settings = {
                crafter: _bonusStats.addCrafterBonusStats($scope.crafter.stats[$scope.recipe.cls], $scope.bonusStats),
                recipe: _bonusStats.addRecipeBonusStats($scope.recipe, $scope.bonusStats),
                sequence: sequence,
                algorithm: $scope.solver.algorithm,
                maxTricksUses: $scope.sequenceSettings.maxTricksUses,
                maxMontecarloRuns: $scope.sequenceSettings.maxMontecarloRuns,
                reliabilityPercent: $scope.sequenceSettings.reliabilityPercent,
                useConditions: $scope.sequenceSettings.useConditions,
                maxLength: $scope.sequenceSettings.maxLengthEnabled ? $scope.sequenceSettings.maxLength : 0,
                solver: $scope.solver,
                debug: $scope.sequenceSettings.debug
            };
            if ($scope.sequenceSettings.specifySeed) {
                settings.seed = $scope.sequenceSettings.seed;
            }
            $scope.pageState.solverStatus.running = true;
            _solver.start(settings, solverProgress, solverSuccess, solverError);
        }

        function resetSolver() {
            $scope.pageState.solverStatus.error = null;
            $scope.pageState.solverStatus.generationsCompleted = 0;
            $scope.pageState.solverStatus.maxGenerations = $scope.solver.generations;
            $scope.pageState.solverStatus.state = null;

            $scope.pageState.solverStatus.logs = {
                setup: '',
                ga: '',
                mc: ''
            };
            $scope.pageState.solverStatus.sequence = [];
        }

        function resumeSolver() {
            $scope.pageState.solverStatus.running = true;
            _solver.resume();
        }

        function stopSolver() {
            _solver.stop();
        }

        function useSolverResult() {
            var newSeq = $scope.pageState.solverStatus.sequence;
            if (newSeq instanceof Array && newSeq.length > 0) {
                $scope.$emit('update.sequence', newSeq);
                $state.go('simulator');
            }
        }

        function equivalentSequence() {
            return angular.equals($scope.pageState.solverStatus.sequence, $scope.sequence)
        }
    }
})();
