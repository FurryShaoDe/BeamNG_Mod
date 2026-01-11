angular.module('beamng.apps')
.directive('power2', [function () {
  return {
    template: '<div><power2temp></power2temp></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element) {

      let vueApp = createVueApp()

      vueApp.component('power2temp', {
        template: `
          <div style="color:white; padding:10px; text-align:center;">
            <div><strong>{{ powerHP.toLocaleString() }}</strong> HP</div>
            <div><strong>{{ torqueNM.toLocaleString() }}</strong> NM</div>
            <div><strong>{{ ratioHP }}</strong> HP/KG</div>
          </div>
        `,
        data() {
          return {
            powerHP: 0,
            torqueNM: 0,
            dynamicWeight: 1,
            ratioHP: '0.000',
            sortedWheelIndices: null
          }
        },

        mounted() {
          /* ---------------- POWER & TORQUE (Lua – max HP & torque) ---------------- */
          const LuaStats = `(function()
            local e = powertrain.getDevicesByCategory("engine")[1]
            local ps, tq = 0, 0
            if e then
              ps = e.maxPower or 0
              tq = e.maxTorque or 0
            end
            return { powerPS = ps, torqueNM = tq }
          end)()`

          const updatePowerTorque = () => {
            bngApi.activeObjectLua(LuaStats, (data) => {
              const hp = Math.max(0, Math.ceil((data.powerPS || 0) * 0.986))
              const tq = Math.max(0, Math.ceil(data.torqueNM || 0))

              this.powerHP = hp
              this.torqueNM = tq
              this.updateRatio()
            })
          }

          updatePowerTorque()
          scope.$on('VehicleFocusChanged', updatePowerTorque)

          /* ---------------- WEIGHT (wheel forces – live) ---------------- */
          const streamsList = ['wheelInfo', 'sensors']
          StreamsManager.add(streamsList)

          scope.$on('$destroy', () => {
            StreamsManager.remove(streamsList)
          })

          scope.$on('streamsUpdate', (event, streams) => {
            if (!streams || !streams.wheelInfo || !streams.sensors) return

            const wheelInfo = streams.wheelInfo
            const gravity = Math.abs(streams.sensors.gravity) || 9.81

            if (!this.sortedWheelIndices || this.sortedWheelIndices.length !== wheelInfo.length) {
              this.sortedWheelIndices = this.getSortedIndices(wheelInfo)
            }

            let totalForce = 0
            for (let i = 0; i < this.sortedWheelIndices.length; i++) {
              const wheel = wheelInfo[this.sortedWheelIndices[i]]
              totalForce += Math.abs(wheel[7])
            }

            const kg = Math.round(totalForce / gravity)
            this.dynamicWeight = Math.max(1, kg)

            this.updateRatio()
          })
        },

        methods: {
          updateRatio() {
            if (this.powerHP > 0 && this.dynamicWeight > 1) {
              let ratio = (this.powerHP / this.dynamicWeight).toPrecision(3)
              this.ratioHP = ratio.replace(/^0\./, '.')
            }
          },

          getSortedIndices(wheelInfo) {
            const names = []
            for (let i in wheelInfo) {
              names.push(wheelInfo[i][0])
            }
            const sortedNames = names.sort()

            const indices = []
            for (let name of sortedNames) {
              for (let j in wheelInfo) {
                if (name === wheelInfo[j][0]) {
                  indices.push(j)
                  break
                }
              }
            }
            return indices
          }
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])
