angular.module('beamng.apps')
.directive('background', [function () {
  return {
    template: '<div><backgroundtemp></backgroundtemp></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element) {

      const vueApp = createVueApp()

      vueApp.component('backgroundtemp', {
        template: `
          <div style="
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background: rgba(25, 25, 25, 0.2);
            border-radius:12px;
            z-index:-999;
            pointer-events:none;
          "></div>
        `
      })

      vueApp.mount(element[0])
      scope.$on('$destroy', () => vueApp.unmount())
    }
  }
}])
