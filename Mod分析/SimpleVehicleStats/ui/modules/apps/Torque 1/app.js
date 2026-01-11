angular.module('beamng.apps')
.directive('torque1', [function () {
  return {
    template: '<div><torque1temp></torque1temp></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element) {

      let vueApp = createVueApp()

      vueApp.component('torque1temp', {
        template: `
          <div style="color:white; padding:10px; text-align:center;">
            <div><strong>{{ torquePercent }}</strong> %</div>
          </div>
        `,
        data() {
          return {
            flywheelTorque: 0,
            maxTorque: 1,  
            torquePercent: '0.0'
          }
        },
        mounted() {
          const streamsList = ['engineInfo']
          StreamsManager.add(streamsList)

          scope.$on('$destroy', () => {
            StreamsManager.remove(streamsList)
          })

          const updateMaxTorque = `(function()
            local e = powertrain.getDevicesByCategory("engine")[1]
            return e and e.maxTorque or 1
          end)()`

          let trueMaxTorque = 1

          // get max torque from the engine once
          bngApi.activeObjectLua(updateMaxTorque, (t) => {
            trueMaxTorque = Math.max(1, t)
            this.maxTorque = trueMaxTorque
          })

          // update live torque from engineInfo
          scope.$on('streamsUpdate', (event, streams) => {
            if (!streams || !streams.engineInfo) return

            const torque = streams.engineInfo[8] // flywheel torque
            this.flywheelTorque = isNaN(torque) ? 0 : Math.round(torque)

            // calculate % of max torque
            this.torquePercent = ((this.flywheelTorque / trueMaxTorque) * 100)
              .toFixed(1)
              .replace(/^0+/, '') // remove leading zero for <1%
          })
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])