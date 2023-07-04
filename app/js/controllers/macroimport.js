(function () {
  'use strict';

  angular
    .module('ffxivCraftOptWeb.controllers')
    .controller('MacroImportController', controller);

  function controller($scope, $modalInstance, $translate, _actionsByName) {
    //noinspection AssignmentResultUsedJS
    var vm = $scope.vm = {};

    vm.macroText = "";

    vm.importMacro = importMacro;
    vm.cancel = cancel;
    vm.canImport = canImport;

    var crafterLevel = $modalInstance.class.level

    // 版本更新，技能升级记得更新
    // var crafterLevel = 60
    var basicSynth = [1, 31]
    var carefulSynthesis = [62, 82]
    var rapidSynthesis = [9, 63]
    var groundwork = [72, 86]
    var levelAction = [basicSynth, carefulSynthesis, rapidSynthesis, groundwork]
    var levelActionName = ['basicSynth', 'carefulSynthesis', 'rapidSynthesis', 'groundwork']
    var delectActionIndex = levelAction
      .map((actionGroups) => {
        var remain = actionGroups.reduce(
          (a, b) => (crafterLevel >= b ? b : a),
          actionGroups[0]
        )
        var remainIndex = actionGroups.indexOf(remain)
        return actionGroups.map((action, index) =>
          index === remainIndex ? -1 : index
        )
      })
      var delectAction = delectActionIndex.map((delectAction, nameIndex) => {
        var actionName = levelActionName[nameIndex]
        return delectAction.map((actionIndex,index) => {
          if (!~actionIndex) {
            return 0
          } else {
            return index === 0 ? actionName : actionName + (index + 1)
          }
        })
      }).reduce((a,b)=>a.concat(b))

    //////////////////////////////////////////////////////////////////////////

    function importMacro() {
      var sequence = convertMacro(vm.macroText);
      if (sequence !== undefined) {
        $modalInstance.close({
          sequence: sequence,
        });
      }
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function canImport() {
      return vm.macroText.trim().length > 0;
    }

    function convertMacro(macroString) {
      if (macroString === null || macroString === "") {
        return undefined;
      }

      var regex = /\/ac(tion)?\s+"?(.*?)"?\s*<wait\.\d+.?\d?>/g;
      var newSequence = [];
      var result;
      while (result = regex.exec(macroString)) {
        var action = result[2];
        for (var key in _actionsByName) {
          var value = _actionsByName[key];
          if (action === value.name || action === $translate.instant(value.name)) {
            newSequence.push(key);
          }
        }
      }
      var newSequence = newSequence.filter(e=>!delectAction.includes(e))
      console.log(delectAction, newSequence)
      if (newSequence.length === 0) {
        window.alert("Error: Invalid macro synth sequence.");
        return undefined;
      }

      return newSequence;
    }
  }

})();
