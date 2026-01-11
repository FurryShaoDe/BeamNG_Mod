angular.module('beamng.apps')
.directive('weight2', [function () {
  return {
    template: '<div><weight2temp></weight2temp></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element, attrs) {
      let vueApp = createVueApp()
      vueApp.component('weight2temp', {
        template:
        `
        <div style="color:white; padding:10px; text-align:center;">
          <div><span style="font-weight:bold">{{ (weights.front.value + weights.rear.value).toLocaleString() }}</span> KG</div>
          <div>F <span style="font-weight:bold">{{ weights.distribution.front }}</span>% | R <span style="font-weight:bold">{{ weights.distribution.rear }}</span>%</div>
          <div>F <span style="font-weight:bold">{{ weights.front.value.toLocaleString() }}</span> KG | R <span style="font-weight:bold">{{ weights.rear.value.toLocaleString() }}</span> KG</div>
        </div>
        `,
        data() {
          return {
            weights: {
              front: { value: 0, leadingZeros: '' },
              rear: { value: 0, leadingZeros: '' },
              distribution: { front: '00', rear: '00' }
            },
            sortedWheelIndices: null
          }
        },
        mounted() {
          var streamsList = ['wheelInfo', 'sensors']
          StreamsManager.add(streamsList)

          scope.$on('$destroy', () => {
            StreamsManager.remove(streamsList)
          })

          scope.$on('streamsUpdate', (event, streams) => {
            if (!streams.wheelInfo || !streams.sensors) return

            const wheelInfo = streams.wheelInfo
            const gravity = Math.abs(streams.sensors.gravity) || 9.81

            if (!this.sortedWheelIndices || wheelInfo.length != this.sortedWheelIndices.length) {
              this.sortedWheelIndices = this.getSortedIndices(wheelInfo)
            }

            let frontForce = 0
            let rearForce = 0

            for (let i = 0; i < this.sortedWheelIndices.length; i++) {
              const wheel = wheelInfo[this.sortedWheelIndices[i]]
              const force = Math.abs(wheel[7])
              if (i < this.sortedWheelIndices.length / 2) {
                frontForce += force
              } else {
                rearForce += force
              }
            }

            const frontWeight = Math.round(frontForce / gravity)
            const rearWeight = Math.round(rearForce / gravity)
            const totalWeight = frontWeight + rearWeight

            const frontDist = Math.round((frontWeight / totalWeight) * 100)
            const rearDist = 100 - frontDist

            // ---- MUTATE PROPERTIES TO KEEP REACTIVITY ----
            this.weights.front.value = frontWeight
            this.weights.front.leadingZeros = ('0000').slice(frontWeight.toString().length)

            this.weights.rear.value = rearWeight
            this.weights.rear.leadingZeros = ('0000').slice(rearWeight.toString().length)

            this.weights.distribution.front = frontDist.toString().padStart(2, '0')
            this.weights.distribution.rear = rearDist.toString().padStart(2, '0')
          })

          scope.$on('VehicleChange', () => {
            this.sortedWheelIndices = null
          })
        },
        methods: {
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
      scope.$on('$destroy', function () {
        vueApp.unmount()
      })
    }
  }
}])
