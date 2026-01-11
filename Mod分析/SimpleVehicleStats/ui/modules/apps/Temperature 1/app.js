angular.module('beamng.apps')
.directive('tempfluids1', [function () {
  return {
    template: '<div><tempfluids1comp></tempfluids1comp></div>',
    replace: true,
    restrict: 'EA',
    link: function(scope, element) {

      const vueApp = createVueApp()

      vueApp.component('tempfluids1comp', {
        template: `
          <div style="color:white; padding:10px; text-align:center;">
          <div>
            <span v-if="fanActive" style="display:inline-block; width:10px;">•</span>
            W: <strong>{{ waterTemp }}</strong>°C
          </div>
          <div>
            O: <strong>{{ oilTemp }}</strong>°C
          </div>
        </div>
        `,
        data() {
          return {
            waterTemp: 0,
            oilTemp: 0,
            fanActive: false
          }
        },
        mounted() {
          const streamsList = ['engineThermalData']
          StreamsManager.add(streamsList)
          scope.$on('$destroy', () => StreamsManager.remove(streamsList))

          scope.$on('streamsUpdate', (e, s) => {
            if (!s?.engineThermalData) return
            this.waterTemp = Math.round(s.engineThermalData.coolantTemperature || 0)
            this.oilTemp = Math.round(s.engineThermalData.oilTemperature || 0)
            this.fanActive = s.engineThermalData.fanActive || false
          })
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', ()=>vueApp.unmount())
    }
  }
}])
