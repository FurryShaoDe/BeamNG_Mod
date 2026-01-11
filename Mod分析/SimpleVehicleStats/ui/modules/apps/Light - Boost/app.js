angular.module('beamng.apps')
.directive('boostlight', [function () {
  return {
    template: '<div><boostlighttemp></boostlighttemp></div>',
    replace: true,
    restrict: 'EA',
    link: function(scope, element) {

      const vueApp = createVueApp()

      vueApp.component('boostlighttemp', {
        template: `
          <div style="position:relative; width:50px; height:50px; display:flex; justify-content:center; align-items:center;">
            
            <!-- Light -->
            <div :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isOn ? currentColor : 'rgba(40,40,40,0.3)',
                  boxShadow: isOn ? '0 0 15px ' + currentColor : 'none',
                  transition: 'all 0.3s ease'
                }"></div>

            <!-- Label -->
            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                        text-align:center; background: rgba(40, 40, 40, 0.4); color:#ccc;
                        font-size:0.6em; border-radius:6px; padding:0px 3px; width:30px;">
              Boost
            </div>
          </div>
        `,
        data() {
          return {
            isOn: false,
            selectedColorName: localStorage.getItem('svsBoostColor') || 'green',
            threshold: Number(localStorage.getItem('svsBoostThreshold')) || 30,
            currentPSI: 0,
            colorMap: {
              red:    { active: '#ff0000' },
              yellow: { active: '#ffff00' },
              blue:   { active: '#00ccff' },
              green:  { active: '#00ff44' },
              purple: { active: '#cc00ff' }
            }
          }
        },
        computed: {
          currentColor() { return this.colorMap[this.selectedColorName].active }
        },
        methods: {
          updateSettings() {
            this.selectedColorName = localStorage.getItem('svsBoostColor') || 'green'
            this.threshold = Number(localStorage.getItem('svsBoostThreshold')) || 30
          }
        },
        mounted() {
          const streamsList = ['forcedInductionInfo']
          StreamsManager.add(streamsList)
          scope.$on('$destroy', () => StreamsManager.remove(streamsList))

          // Listen for updates from SVS Settings
          window.addEventListener('svsUpdate', this.updateSettings)
          this.updateSettings()

          // Live boost update
          scope.$on('streamsUpdate', (event, streams) => {
            if (!streams?.forcedInductionInfo) return

            // Convert boost to PSI
            const rawBoost = streams.forcedInductionInfo.boost || 0
            this.currentPSI = rawBoost * 0.145

            // Update light state
            this.isOn = this.currentPSI >= this.threshold
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
