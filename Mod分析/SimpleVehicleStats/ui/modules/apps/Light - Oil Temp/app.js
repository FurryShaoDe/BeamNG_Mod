angular.module('beamng.apps')
.directive('oiltemplight', [function () {
  return {
    template: '<div><oiltemplighttemp></oiltemplighttemp></div>',
    replace: true,
    restrict: 'EA',
    link: function(scope, element) {

      const vueApp = createVueApp()

      vueApp.component('oiltemplighttemp', {
        template: `
          <div style="position:relative; width:50px; height:50px; display:flex; justify-content:center; align-items:center;">
            <!-- Light -->
            <div :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isFlashing
                    ? (flashToggle ? currentColor : 'rgba(40,40,40,0.3)')
                    : (isSolid ? currentColor : 'rgba(40,40,40,0.3)'),
                  boxShadow:
                    isFlashing
                      ? (flashToggle ? '0 0 15px ' + currentColor : 'none')
                      : isSolid
                        ? '0 0 15px ' + currentColor
                        : 'none',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }">

              <span v-if="showTempText"
                    style="color:white; font-size:0.7em; text-shadow:0 0 2px black;">
                <strong>{{ temp }}</strong>
              </span>
            </div>

            <!-- Label -->
            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                        text-align:center; background: rgba(40, 40, 40, 0.4); color:#ccc;
                        font-size:0.6em; border-radius:6px; padding:0px 3px; width:30px;">
              Oil
            </div>
          </div>
        `,
        data() {
          return {
            temp: 0,
            flashToggle: true,
            flashInterval: null,
            solidThreshold: Number(localStorage.getItem('svsOilSolid')) || 140,
            flashThreshold: Number(localStorage.getItem('svsOilFlash')) || 150,
            selectedColorName: localStorage.getItem('svsOilColor') || 'red',
            isSolid: false,
            isFlashing: false,
            colorMap: {
              red:'#ff0000', yellow:'#ffff00', blue:'#00ccff', green:'#00ff44', purple:'#cc00ff'
            },
          showTempText: localStorage.getItem('svsShowOilTempText') !== 'false',
          }
        },
        computed: { currentColor() { return this.colorMap[this.selectedColorName] } },
        methods: {
          updateSettings() {
            this.solidThreshold = Number(localStorage.getItem('svsOilSolid')) || 140
            this.flashThreshold = Number(localStorage.getItem('svsOilFlash')) || 150
            this.selectedColorName = localStorage.getItem('svsOilColor') || 'red'
            this.showTempText = localStorage.getItem('svsShowOilTempText') !== 'false'
          }
        },
        mounted() {
          this.flashInterval = setInterval(() => this.flashToggle = !this.flashToggle, 500)
          window.addEventListener('svsUpdate', this.updateSettings)
          this.updateSettings()

          const streams = ['engineThermalData']
          StreamsManager.add(streams)
          scope.$on('$destroy', () => StreamsManager.remove(streams))

          scope.$on('streamsUpdate', (e, s) => {
            if (!s?.engineThermalData) return
            this.temp = Math.round(s.engineThermalData.oilTemperature || 0)
            this.isSolid = this.temp >= this.solidThreshold
            this.isFlashing = this.temp >= this.flashThreshold
          })
        },
        beforeUnmount() {
          clearInterval(this.flashInterval)
          window.removeEventListener('svsUpdate', this.updateSettings)
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])
