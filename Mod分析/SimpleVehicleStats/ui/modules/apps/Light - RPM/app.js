angular.module('beamng.apps')
.directive('shiftlight', [function () {
  return {
    template: '<div><shiftlightlight></shiftlightlight></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element) {

      const vueApp = createVueApp()

      vueApp.component('shiftlightlight', {
        template: `
          <div style="position:absolute; top:0; left:0; width:100%; height:100%;
                      display:flex; justify-content:center; align-items:center;">
            <div :style="lightStyle"></div>
          </div>
        `,

        data() {
          return {
            rpm: 0,
            maxRPM: 0,

            flashToggle: true,
            flashInterval: null,

            solidThreshold: Number(localStorage.getItem('svsShiftlightSolid')) || 70,
            flashThreshold: Number(localStorage.getItem('svsShiftlightFlash')) || 95,
            selectedColorName: localStorage.getItem('svsShiftlightColor') || 'red',
            size: Number(localStorage.getItem('svsShiftlightSize')) || 80,

            colorMap: {
              red:    { active:'#ff0000' },
              yellow: { active:'#ffff00' },
              blue:   { active:'#00ccff' },
              green:  { active:'#00ff44' },
              purple: { active:'#cc00ff' }
            }
          }
        },

        computed: {
          solidRPM() {
            return this.maxRPM > 0
              ? Math.round(this.maxRPM * this.solidThreshold / 100)
              : 0
          },
          flashRPM() {
            return this.maxRPM > 0
              ? Math.round(this.maxRPM * this.flashThreshold / 100)
              : 0
          },

          isSolid() {
            return this.rpm >= this.solidRPM && this.solidRPM > 0
          },
          isFlashing() {
            return this.rpm >= this.flashRPM && this.flashRPM > 0
          },

          lightStyle() {
            const activeColor = this.colorMap[this.selectedColorName].active
            const offColor = 'rgba(40,40,40,0.3)' // dark grey

            let color = (this.isFlashing ? (this.flashToggle ? activeColor : offColor)
                          : this.isSolid ? activeColor
                          : offColor)

            let glow = (this.isSolid || this.isFlashing) ? this.size / 2 : 0

            return {
              width: this.size + 'px',
              height: this.size + 'px',
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: glow ? `0 0 ${glow}px ${activeColor}` : 'none',
              border: '2px solid rgba(255,255,255,0.2)'
            }
          }
        },

        methods: {
          readSettings() {
            this.solidThreshold = Number(localStorage.getItem('svsShiftlightSolid')) || 70
            this.flashThreshold = Number(localStorage.getItem('svsShiftlightFlash')) || 95
            this.selectedColorName = localStorage.getItem('svsShiftlightColor') || 'red'
            this.size = Number(localStorage.getItem('svsShiftlightSize')) || 80
          },
          updateSize(delta) {
            this.size = Math.max(40, Math.min(200, this.size + delta))
            localStorage.setItem('svsShiftlightSize', this.size)
          }
        },

        mounted() {
          this.readSettings()

          // Flash toggle
          this.flashInterval = setInterval(() => {
            this.flashToggle = !this.flashToggle
          }, 50)

          window.addEventListener('svsUpdate', this.readSettings)

          const streams = ['engineInfo']
          StreamsManager.add(streams)
          
          // Request torque to get maxRPM
          const requestTorque = () =>
            bngApi.activeObjectLua('controller.mainController.sendTorqueData()')
          requestTorque()

          // Listen for maxRPM from vehicle changes
          scope.$on('TorqueCurveChanged', (e, data) => {
            if (data?.maxRPM) this.maxRPM = data.maxRPM
          })
          scope.$on('VehicleChange', requestTorque)
          scope.$on('VehicleFocusChanged', requestTorque)

          // Update RPM live
          scope.$on('streamsUpdate', (e, s) => {
            if (!s?.engineInfo) return
            this.rpm = s.engineInfo[4] || 0
            if (!this.maxRPM && s.engineInfo[5]) this.maxRPM = s.engineInfo[5]
          })

          scope.$on('$destroy', () => {
            StreamsManager.remove(streams)
            clearInterval(this.flashInterval)
            window.removeEventListener('svsUpdate', this.readSettings)
          })
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])
