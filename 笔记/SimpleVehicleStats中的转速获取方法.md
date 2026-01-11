这个 Mod 是通过 BeamNG.drive 的 **UI Streams (数据流)** 系统来获取实时车辆数据的，并使用 **Vue.js** 来动态计算样式从而实现显示效果。

以下是具体的代码分析和原理拆解：

### 1. 如何获取转速数值 (RPM)

该 Mod 主要通过监听 BeamNG 的 `streamsUpdate` 事件来获取每一帧的物理数据。

- 启用数据流：
    
    在 mounted() 生命周期中，代码首先注册了 engineInfo 数据流：

    ```JavaScript
    const streams = ['engineInfo']
    StreamsManager.add(streams)
    ```
    
- 读取实时转速：
    
    它监听 $on('streamsUpdate') 事件。当游戏物理引擎更新时，会返回一个包含引擎信息的数组 s.engineInfo。
    
    代码中通过 索引 4 获取当前转速：

    ```JavaScript
    scope.$on('streamsUpdate', (e, s) => {
      if (!s?.engineInfo) return
      this.rpm = s.engineInfo[4] || 0  // <--- 这里获取实时转速
      // ...
    })
    ```
    
- 获取最大转速 (红线区)：
    
    为了计算何时亮灯，它还需要知道车辆的最高转速（MaxRPM）。它用了两种方法：
    
    1. **主动询问 (Lua)：** 调用 `controller.mainController.sendTorqueData()` 让车辆控制器发送扭矩数据，然后在 `TorqueCurveChanged` 事件中读取 `data.maxRPM`。
        
    2. **被动兜底：** 如果上面的方法没拿到，它会尝试从 `engineInfo` 的 **索引 `5`** (`s.engineInfo[5]`) 获取最大转速。
        

### 2. 如何显示 (渲染逻辑)

显示的逻辑是由内嵌的 **Vue.js** 组件处理的。它并没有使用复杂的 Canvas 绘图，而是通过动态修改 HTML `<div>` 元素的 **CSS 样式** 来模拟灯光。

- 判断状态 (Computed Properties)：
    
    Vue 的计算属性实时比较 this.rpm (当前转速) 和设定好的阈值：
    
    - `isSolid`: 转速超过常亮阈值 (默认 70%)。
        
    - `isFlashing`: 转速超过闪烁阈值 (默认 95%)。
        
- 动态样式 (lightStyle)：
    
    这是显示的核心。lightStyle 函数返回一个 CSS 对象，绑定到 HTML 元素上 (<div :style="lightStyle"></div>)。
    
    它决定了灯的颜色和发光效果：

    ```JavaScript
    lightStyle() {
      // 1. 确定颜色：如果是闪烁状态，且 flashToggle 为 true，则显示亮色；否则根据状态决定是亮色还是暗灰色(offColor)
      let color = (this.isFlashing ? (this.flashToggle ? activeColor : offColor)
                    : this.isSolid ? activeColor
                    : offColor)
    
      // 2. 确定发光效果 (Glow)：如果灯亮了，计算一个阴影半径
      let glow = (this.isSolid || this.isFlashing) ? this.size / 2 : 0
    
      // 3. 返回 CSS 样式
      return {
        width: this.size + 'px',
        height: this.size + 'px',
        backgroundColor: color,                     // <-- 改变背景色实现“亮/灭”
        boxShadow: glow ? `0 0 ${glow}px ${activeColor}` : 'none', // <-- CSS 阴影模拟发光
        // ...
      }
    }
    ```
    
- 闪烁机制：
    
    为了实现到达红线时的爆闪效果，代码中使用了一个定时器 (setInterval)，每 50毫秒 切换一次布尔值 flashToggle：
    
    ```JavaScript
    this.flashInterval = setInterval(() => {
      this.flashToggle = !this.flashToggle
    }, 50)
    ```
    
    当 `isFlashing` 为真时，`lightStyle` 会根据这个每50ms变化一次的 `flashToggle` 在“高亮颜色”和“暗灰色”之间快速切换，产生频闪视觉效果。
    

### 总结

- **输入：** 依靠 `StreamsManager` 订阅 `engineInfo`，从数组第4位拿到 RPM。
    
- **输出：** 依靠 Vue.js 的数据绑定，根据 RPM 修改 `div` 的 `backgroundColor` (背景色) 和 `boxShadow` (外发光)，并配合 JS 定时器实现高频闪烁。