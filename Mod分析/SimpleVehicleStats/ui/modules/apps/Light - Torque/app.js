angular.module('beamng.apps')
.directive('torquelight', [function () {
  return {
    template: '<div><torquelighttemp></torquelighttemp></div>',
    replace: true,
    restrict: 'EA',
    link: function(scope, element) {

      const vueApp = createVueApp()

      vueApp.component('torquelighttemp', {
        template: `
          <div style="position:relative; width:50px; height:50px; display:flex; justify-content:center; align-items:center;">
            
            <!-- Light -->
            <div :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isOn ? currentColor : 'rgba(40, 40, 40, 0.3)',
                  boxShadow: isOn ? '0 0 15px ' + currentColor : 'none',
                  transition: 'all 0.3s ease'
                }"></div>

            <!-- Label -->
            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                        text-align:center; background: rgba(40, 40, 40, 0.4); color:#ccc;
                        font-size:0.6em; border-radius:6px; padding:0px 3px; width:30px;">
              Torque
            </div>

          </div>
        `,
        data() {
          return {
            isOn: false,
            selectedColorName: localStorage.getItem('svsTorqueColor') || 'yellow',
            warningThreshold: Number(localStorage.getItem('svsTorqueWarn')) || 95,
            colorMap: {
              red:    { active: '#ff0000' },
              yellow: { active: '#ffff00' },
              blue:   { active: '#00ccff' },
              green:  { active: '#00ff44' },
              purple: { active: '#cc00ff' }
            },
            maxTorque: 1
          }
        },
        computed: {
          currentColor() { return this.colorMap[this.selectedColorName].active }
        },
        methods: {
          updateSettings() {
            this.selectedColorName = localStorage.getItem('svsTorqueColor') || 'yellow'
            this.warningThreshold = Number(localStorage.getItem('svsTorqueWarn')) || 95
          }
        },
        mounted() {
          const streamsList = ['engineInfo']
          StreamsManager.add(streamsList)
          scope.$on('$destroy', () => StreamsManager.remove(streamsList))

          const updateMaxTorque = `(function()
            local e = powertrain.getDevicesByCategory("engine")[1]
            return e and e.maxTorque or 1
          end)()`

          bngApi.activeObjectLua(updateMaxTorque, (t) => {
            this.maxTorque = Math.max(1, t)
          })

          // Listen for updates from SVS Settings
          window.addEventListener('svsUpdate', this.updateSettings)
          this.updateSettings() // initial read

          // Live torque update
          scope.$on('streamsUpdate', (event, streams) => {
            if (!streams || !streams.engineInfo) return
            const torque = streams.engineInfo[8]
            const percent = Math.max(0, Math.min(100, (torque / this.maxTorque) * 100))
            this.isOn = percent >= this.warningThreshold
          })
        },
        beforeUnmount() {
          window.removeEventListener('svsUpdate', this.updateSettings)
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])
