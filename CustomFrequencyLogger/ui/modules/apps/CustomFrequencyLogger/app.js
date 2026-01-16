angular.module('beamng.apps')
.directive('customfrequencylogger', [function () {
  return {
    templateUrl: '/ui/modules/apps/CustomFrequencyLogger/app.html',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      // DEFAULT SET TO 0.1 (10Hz)
      scope.updatePeriod = 0.1
      scope.module_general = true
      scope.module_wheels = true
      scope.module_engine = true
      scope.module_inputs = true
      scope.module_powertrain = true
      scope.outputFileName = 'custom_settings.json'
      scope.inputFileName = 'custom_settings.json'
      scope.outputDir = 'CustomLog'

      // 注意：这里调用的 Lua 扩展名已改为 customFrequencyLogger
      scope.applySettings = function() {
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.updatePeriod = ${scope.updatePeriod}`)
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.useModule["General"] = ${scope.module_general}`)
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.useModule["Wheels"] = ${scope.module_wheels}`)
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.useModule["Inputs"] = ${scope.module_inputs}`)
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.useModule["Engine"] = ${scope.module_engine}`)
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.useModule["Powertrain"] = ${scope.module_powertrain}`)
      }

      scope.useAsOutputDir = function() {
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.settings.outputDir = "${scope.outputDir}"`)
      }

      scope.getNewOutputFilename = function() {
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.suggestOutputFilename()`, function(data) {
          scope.outputFileName = data
        })
      }

      scope.saveSettingsToJson = function() {
        if(scope.outputFileName === '') return
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.writeSettingsToJSON("${scope.outputFileName}")`)
      }

      scope.importSettingsFromFile = function() {
        if(scope.inputFileName === '') return
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.applySettingsFromJSON("${scope.inputFileName}")`)
        // 使用 eval 获取新的扩展设置状态
        scope.module_general = eval(`${extensions.customFrequencyLogger.settings.useModule["General"]}`)
        scope.module_wheels = eval(`${extensions.customFrequencyLogger.settings.useModule["Wheels"]}`)
        scope.module_inputs = eval(`${extensions.customFrequencyLogger.settings.useModule["Inputs"]}`)
        scope.module_engine = eval(`${extensions.customFrequencyLogger.settings.useModule["Engine"]}`)
        scope.module_powertrain = eval(`${extensions.customFrequencyLogger.settings.useModule["Powertrain"]}`)
      }

      scope.startLogging = function() {
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.startLogging()`)
      }

      scope.stopLogging = function() {
        bngApi.activeObjectLua(`extensions.customFrequencyLogger.stopLogging()`)
      }
    }
  }
}]);