angular.module('beamng.apps')
.directive('svssettings', [function () {
  return {
    template: '<div><svssettingstemp></svssettingstemp></div>',
    replace: true,
    restrict: 'EA',
    link: function (scope, element) {

      const vueApp = createVueApp()

      vueApp.component('svssettingstemp', {
        template: `
          <div>
            <!-- Gear icon toggle -->
            <div @click="toggleVisible"
                style="position:fixed; bottom:10px; right:10px; width:36px; height:36px; border-radius:50%;
                       background:rgba(80,80,80,0.7); display:flex; justify-content:center; align-items:center;
                       cursor:pointer; z-index:999;">
              <span style="color:white; font-weight:bold; font-size:30px; line-height:1;">⚙</span>
            </div>

            <!-- Settings panel -->
            <div v-if="visible"
                style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);
                       width:800px; max-height:80vh; overflow-y:auto; background:rgba(40,40,40,0.95);
                       padding:25px; border-radius:10px; z-index:999; color:white; font-family:sans-serif;
                       box-shadow:0 0 20px rgba(0,0,0,0.6); display:grid; grid-template-columns:repeat(2,1fr);
                       gap:25px;">

              <div style="font-size:2em; font-weight:bold; grid-column:1/-1; text-align:center; margin-bottom:25px;">
                Simple Vehicle Settings
              </div>

              <!-- Shiftlight -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Shift Light</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div>Solid Threshold: <strong>{{ shiftlight.solidThreshold }}%</strong>
                  <span style="opacity:0.65">({{ solidRPM ? solidRPM.toLocaleString() : '—' }} rpm)</span>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(shiftlight,-10,'solid')">-10%</button>
                  <button @click="changeThreshold(shiftlight,-1,'solid')">-1%</button>
                  <button @click="changeThreshold(shiftlight,1,'solid')">+1%</button>
                  <button @click="changeThreshold(shiftlight,10,'solid')">+10%</button>
                </div>
                <div>Flash Threshold: <strong>{{ shiftlight.flashThreshold }}%</strong>
                  <span style="opacity:0.65">({{ flashRPM ? flashRPM.toLocaleString() : '—' }} rpm)</span>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(shiftlight,-10,'flash')">-10%</button>
                  <button @click="changeThreshold(shiftlight,-1,'flash')">-1%</button>
                  <button @click="changeThreshold(shiftlight,1,'flash')">+1%</button>
                  <button @click="changeThreshold(shiftlight,10,'flash')">+10%</button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: shiftlightCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap; margin-bottom:10px;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(shiftlight,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
                <div>Light Size: <strong>{{ shiftlight.size }}px</strong></div>
                <div style="display:flex; gap:5px; justify-content:center;">
                  <button @click="changeSize(shiftlight,-10)">-10</button>
                  <button @click="changeSize(shiftlight,-5)">-5</button>
                  <button @click="changeSize(shiftlight,5)">+5</button>
                  <button @click="changeSize(shiftlight,10)">+10</button>
                </div>
              </div>

              <!-- Water Temp Light -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Water Temp</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div>Solid: <strong>{{ water.solidThreshold }}°C</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(water,-5,'solid')">-5</button>
                  <button @click="changeThreshold(water,-1,'solid')">-1</button>
                  <button @click="changeThreshold(water,1,'solid')">+1</button>
                  <button @click="changeThreshold(water,5,'solid')">+5</button>
                </div>
                <div>Flash: <strong>{{ water.flashThreshold }}°C</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(water,-5,'flash')">-5</button>
                  <button @click="changeThreshold(water,-1,'flash')">-1</button>
                  <button @click="changeThreshold(water,1,'flash')">+1</button>
                  <button @click="changeThreshold(water,5,'flash')">+5</button>
                </div>
                <label style="display:flex; gap:8px; justify-content:center;">
                  Show Temp in Light: 
                  <input type="checkbox" v-model="showWaterTempText" @change="saveTempTextToggles">
                </label>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: waterCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(water,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
              </div>

              <!-- Boost Light -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Boost</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div style="margin-bottom:5px; font-size:0.9em; opacity:0.8;">
                  Current Boost: <strong>{{ Math.floor(boostPSI) }} PSI</strong>
                </div>
                <div>Threshold: <strong>{{ boost.threshold }} PSI</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(boost,-5)">-5</button>
                  <button @click="changeThreshold(boost,-1)">-1</button>
                  <button @click="changeThreshold(boost,1)">+1</button>
                  <button @click="changeThreshold(boost,5)">+5</button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: boostCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(boost,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
              </div>

              <!-- Oil Temp Light -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Oil Temp</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div>Solid: <strong>{{ oil.solidThreshold }}°C</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(oil,-5,'solid')">-5</button>
                  <button @click="changeThreshold(oil,-1,'solid')">-1</button>
                  <button @click="changeThreshold(oil,1,'solid')">+1</button>
                  <button @click="changeThreshold(oil,5,'solid')">+5</button>
                </div>
                <div>Flash: <strong>{{ oil.flashThreshold }}°C</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(oil,-5,'flash')">-5</button>
                  <button @click="changeThreshold(oil,-1,'flash')">-1</button>
                  <button @click="changeThreshold(oil,1,'flash')">+1</button>
                  <button @click="changeThreshold(oil,5,'flash')">+5</button>
                </div>
                <label style="display:flex; gap:8px; justify-content:center;">
                  Show Temp in Light: 
                  <input type="checkbox" v-model="showOilTempText" @change="saveTempTextToggles">
                </label>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: oilCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(oil,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
              </div>

              <!-- Torque Light -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Torque</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div>Threshold: <strong>{{ torque.warningThreshold }}%</strong></div>
                <div style="display:flex; gap:5px; justify-content:center; margin-bottom:10px;">
                  <button @click="changeThreshold(torque,-10)">-10%</button>
                  <button @click="changeThreshold(torque,-1)">-1%</button>
                  <button @click="changeThreshold(torque,1)">+1%</button>
                  <button @click="changeThreshold(torque,10)">+10%</button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: torqueCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(torque,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
              </div>

              <!-- Rad Fan Light -->
              <div style="text-align:center;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                  <div style="padding:0 12px; font-weight:bold; font-size:1.4em;">Rad Fan</div>
                  <div style="flex:1; height:1px; background:rgba(255,255,255,0.3);"></div>
                </div>
                <div style="display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:10px;">
                  Color: <div :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: fanCurrentColor, border:'1px solid white' }"></div>
                </div>
                <div style="display:flex; gap:5px; justify-content:center; flex-wrap:wrap;">
                  <button v-for="color in Object.keys(colorMap)" @click="setColor(fan,color)"
                          :style="{ width:'25px', height:'25px', borderRadius:'50%', backgroundColor: colorMap[color].active, border:'1px solid white' }"></button>
                </div>
              </div>

            </div>
          </div>
        `,
        data() {
          return {
            visible: false,
            colorMap: { red:{active:'#ff0000'}, yellow:{active:'#ffff00'}, blue:{active:'#00ccff'}, green:{active:'#00ff44'}, purple:{active:'#cc00ff'} },
            shiftlight: { solidThreshold:Number(localStorage.getItem('svsShiftlightSolid'))||70, flashThreshold:Number(localStorage.getItem('svsShiftlightFlash'))||95, selectedColorName:localStorage.getItem('svsShiftlightColor')||'red', size:Number(localStorage.getItem('svsShiftlightSize'))||80 },
            water: { solidThreshold:Number(localStorage.getItem('svsWaterSolid'))||95, flashThreshold:Number(localStorage.getItem('svsWaterFlash'))||105, selectedColorName:localStorage.getItem('svsWaterColor')||'yellow' },
            boost: { threshold:Number(localStorage.getItem('svsBoostThreshold'))||30, selectedColorName:localStorage.getItem('svsBoostColor')||'green' },
            oil: { solidThreshold:Number(localStorage.getItem('svsOilSolid'))||140, flashThreshold:Number(localStorage.getItem('svsOilFlash'))||150, selectedColorName:localStorage.getItem('svsOilColor')||'red' },
            torque: { warningThreshold:Number(localStorage.getItem('svsTorqueWarn'))||95, selectedColorName:localStorage.getItem('svsTorqueColor')||'yellow' },
            fan: { selectedColorName: localStorage.getItem('svsFanColor')||'green' },
            showWaterTempText: localStorage.getItem('svsShowWaterTempText') !== 'false',
            showOilTempText: localStorage.getItem('svsShowOilTempText') !== 'false',
            maxRPM:0,
            boostPSI:0
          }
        },
        computed: {
          shiftlightCurrentColor() { return this.colorMap[this.shiftlight.selectedColorName].active },
          waterCurrentColor() { return this.colorMap[this.water.selectedColorName].active },
          boostCurrentColor() { return this.colorMap[this.boost.selectedColorName].active },
          oilCurrentColor() { return this.colorMap[this.oil.selectedColorName].active },
          torqueCurrentColor() { return this.colorMap[this.torque.selectedColorName].active },
          fanCurrentColor() { return this.colorMap[this.fan.selectedColorName].active },
          solidRPM() { return this.maxRPM ? Math.round(this.maxRPM*this.shiftlight.solidThreshold/100) : null },
          flashRPM() { return this.maxRPM ? Math.round(this.maxRPM*this.shiftlight.flashThreshold/100) : null }
        },
        methods: {
          toggleVisible(){ this.visible=!this.visible },
          changeThreshold(app, delta, stage) {
            if (stage === 'solid') {
              let max = 100
              if (app === this.water || app === this.oil) max = 180
              app.solidThreshold = Math.max(0, Math.min(max, app.solidThreshold + delta))
              if (app.flashThreshold < app.solidThreshold) {
                app.flashThreshold = app.solidThreshold
                if (app === this.shiftlight)
                  localStorage.setItem('svsShiftlightFlash', app.flashThreshold)
                if (app === this.water)
                  localStorage.setItem('svsWaterFlash', app.flashThreshold)
                if (app === this.oil)
                  localStorage.setItem('svsOilFlash', app.flashThreshold)
              }
              if (app === this.shiftlight)
                localStorage.setItem('svsShiftlightSolid', app.solidThreshold)
              if (app === this.water)
                localStorage.setItem('svsWaterSolid', app.solidThreshold)
              if (app === this.oil)
                localStorage.setItem('svsOilSolid', app.solidThreshold)
            }
            else if (stage === 'flash') {
              let max = 100
              if (app === this.water || app === this.oil) max = 180
              app.flashThreshold = Math.max(
                app.solidThreshold,
                Math.min(max, app.flashThreshold + delta)
              )
              if (app === this.shiftlight)
                localStorage.setItem('svsShiftlightFlash', app.flashThreshold)
              if (app === this.water)
                localStorage.setItem('svsWaterFlash', app.flashThreshold)
              if (app === this.oil)
                localStorage.setItem('svsOilFlash', app.flashThreshold)
            }
            else if (app === this.boost) {
              app.threshold = Math.max(0, app.threshold + delta)
              localStorage.setItem('svsBoostThreshold', app.threshold)
            }
            else if (app === this.torque) {
              app.warningThreshold = Math.max(
                0,
                Math.min(100, app.warningThreshold + delta)
              )
              localStorage.setItem('svsTorqueWarn', app.warningThreshold)
            }
            window.dispatchEvent(new Event('svsUpdate'))
          },
          
          saveTempTextToggles() {
            localStorage.setItem('svsShowWaterTempText', this.showWaterTempText)
            localStorage.setItem('svsShowOilTempText', this.showOilTempText)
            window.dispatchEvent(new Event('svsUpdate'))
          },
          changeSize(app,delta){ app.size=Math.max(20,Math.min(120,app.size+delta)); localStorage.setItem('svsShiftlightSize',app.size); window.dispatchEvent(new Event('svsUpdate')) },
          setColor(app,color){ app.selectedColorName=color;
            if(app===this.shiftlight) localStorage.setItem('svsShiftlightColor',color)
            else if(app===this.boost) localStorage.setItem('svsBoostColor',color)
            else if(app===this.torque) localStorage.setItem('svsTorqueColor',color)
            else if(app===this.water) localStorage.setItem('svsWaterColor',color)
            else if(app===this.oil) localStorage.setItem('svsOilColor',color)
            else if(app===this.fan) localStorage.setItem('svsFanColor',color)
            window.dispatchEvent(new Event('svsUpdate'))
          }
        },
        mounted(){
          const streams = ['engineInfo','engineThermalData','forcedInductionInfo']
          StreamsManager.add(streams)

          const requestTorque = ()=> bngApi.activeObjectLua('controller.mainController.sendTorqueData()')
          requestTorque()

          scope.$on('TorqueCurveChanged', (e, data)=>{ if(data?.maxRPM) this.maxRPM = data.maxRPM })
          scope.$on('VehicleChange', requestTorque)
          scope.$on('VehicleFocusChanged', requestTorque)

          scope.$on('streamsUpdate',(e,s)=>{
            if(s?.engineInfo){ if(!this.maxRPM && s.engineInfo[5]) this.maxRPM = s.engineInfo[5] }
            if(s?.forcedInductionInfo){ this.boostPSI = (s.forcedInductionInfo.boost||0)*0.145 }
            if(s?.engineThermalData){
              // could also update previews if needed
            }
          })

          scope.$on('$destroy',()=>StreamsManager.remove(streams))
        }
      })

      vueApp.mount(element[0])
      scope.$on('$destroy',()=>vueApp.unmount())
    }
  }
}])
