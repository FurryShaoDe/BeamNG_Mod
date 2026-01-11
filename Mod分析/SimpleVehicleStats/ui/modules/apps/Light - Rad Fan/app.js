angular.module('beamng.apps')
.directive('radfanlight', [function () {
  return {
    template: '<div><radfanlighttemp></radfanlighttemp></div>',
    replace: true,
    restrict: 'EA',
    link: function(scope, element) {

      const vueApp = createVueApp()

      vueApp.component('radfanlighttemp', {
        template: `
          <div style="position:relative; width:50px; height:50px; display:flex; justify-content:center; align-items:center;">
            <div :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: isOn ? currentColor : 'rgba(40,40,40,0.3)',
                  boxShadow: isOn ? '0 0 15px ' + currentColor : 'none',
                  transition: 'all 0.3s ease'
                }"></div>

            <div style="position:absolute; bottom:0; left:50%; transform:translateX(-50%);
                        text-align:center; background: rgba(40, 40, 40, 0.4); color:#ccc;
                        font-size:0.6em; border-radius:6px; padding:0px 3px; width:30px;">
              Fan
            </div>
          </div>
        `,
        data() {
          return {
            isOn: false,
            selectedColorName: localStorage.getItem('svsFanColor') || 'green',
            colorMap: {
              red: '#ff0000',
              yellow: '#ffff00',
              blue: '#00ccff',
              green: '#00ff44',
              purple: '#cc00ff'
            }
          }
        },
        computed: {
          currentColor() { return this.colorMap[this.selectedColorName] }
        },
        methods: {
          updateSettings() {
            this.selectedColorName = localStorage.getItem('svsFanColor') || 'green'
          }
        },
        mounted() {
          window.addEventListener('svsUpdate', this.updateSettings)
          this.updateSettings()

          const streams = ['engineThermalData']
          StreamsManager.add(streams)
          scope.$on('$destroy', () => StreamsManager.remove(streams))

          scope.$on('streamsUpdate', (e, s) => {
            if (!s?.engineThermalData) return
            this.isOn = !!s.engineThermalData.fanActive
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
