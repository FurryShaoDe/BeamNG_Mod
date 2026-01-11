这个 Mod 是通过 **BeamNG.drive 的 AngularJS 前端架构** 中嵌入 **Vue.js** 组件来实现的。它使用了两种主要方式从游戏引擎获取数据：**Lua 脚本注入**（用于引擎参数）和 **数据流（Streams）**（用于物理计算）。
### 1. 马力 (HP) 与 扭矩 (NM) 的获取

这部分数据不是实时的输出功率，而是引擎的**最大额定数值**。它是通过执行一段 Lua 脚本从车辆的动力总成（Powertrain）模块中读取的。

- **机制**: 使用 `bngApi.activeObjectLua` 发送 Lua 代码到游戏引擎。
    
- **Lua 代码逻辑**:

    ```Lua
    (function()
      -- 获取车辆引擎设备列表中的第一个引擎
      local e = powertrain.getDevicesByCategory("engine")[1]
      local ps, tq = 0, 0
      if e then
        -- 读取引擎定义的最大功率 (PS) 和最大扭矩 (NM)
        ps = e.maxPower or 0
        tq = e.maxTorque or 0
      end
      return { powerPS = ps, torqueNM = tq }
    end)()
    ```
    
- **计算与转换**:
    
    - 马力: 获取到的单位是公制马力 (PS)，代码乘以 0.986 将其转换为英制马力 (HP)。
        
        const hp = Math.max(0, Math.ceil((data.powerPS || 0) * 0.986))
        
    - **扭矩**: 直接使用牛米 (NM)。
        
- **触发时机**: 当 UI 加载完成 (`mounted`) 或者切换车辆 (`VehicleFocusChanged`) 时触发一次。
    

### 2. 重量 (KG) 的获取

重量并不是从车辆配置文件中读取的静态数值（Curb Weight），而是通过物理引擎实时计算的**动态重量**（Dynamic Weight）。

- **机制**: 使用 BeamNG 的 `StreamsManager` 订阅实时数据流。
    
- **订阅的数据**:
    
    - `wheelInfo`: 包含每个车轮详细物理数据的数组。
        
    - `sensors`: 包含重力（gravity）等环境传感器数据。
        
- **计算逻辑**:
    
    1. 监听 `streamsUpdate` 事件（每帧或高频率更新）。
        
    2. 遍历所有车轮，获取 `wheel[7]`。在 BeamNG 的数据流中，索引 `7` 通常代表车轮受到的**垂直反作用力**（Downforce/Load，单位是牛顿）。
        
    3. 将所有车轮的垂直力相加得到总支撑力。
        
    4. 利用公式 $m = F / g$ 计算质量。
        
    ```JavaScript
    // 累加每个车轮的垂直受力
    totalForce += Math.abs(wheel[7])
    // 除以重力加速度 (默认为 9.81) 得到公斤数
    const kg = Math.round(totalForce / gravity)
    ```
    
    _注意：因为它是基于受力计算的，当车辆跳跃（腾空）时，显示的重量会变为 0 或接近 0；当车辆受到下压力（空气动力学）时，显示的重量可能会增加。_
    

### 3. 推重比 (HP/KG) 的计算

这是在前端 JavaScript 中进行的简单除法运算：

- **公式**: `马力 / 动态重量`
    
- **代码**:

    ```JavaScript
    let ratio = (this.powerHP / this.dynamicWeight).toPrecision(3)
    // 去掉前导零 (例如 0.123 变成 .123) 用于美观
    this.ratioHP = ratio.replace(/^0\./, '.')
    ```
    

### 4. 数据的显示 (UI 渲染)

这个 Mod 的独特之处在于它在 BeamNG 传统的 AngularJS 环境中创建了一个小型的 **Vue 3** 实例来处理渲染，这样更新界面更高效。

- 模板 (Template):
    
    使用了 Vue 的模板语法 {{ }} 来绑定数据。

    ```HTML
    <div style="color:white; padding:10px; text-align:center;">
      <div><strong>{{ powerHP.toLocaleString() }}</strong> HP</div>
      <div><strong>{{ torqueNM.toLocaleString() }}</strong> NM</div>
      <div><strong>{{ ratioHP }}</strong> HP/KG</div>
    </div>
    ```
    
- **样式**: 直接内联写在 `div` 上（白色文字，居中）。`app.json` 中定义了整个 App 的 CSS 尺寸（宽110px，高80px）。
    

### 总结

| **数值**  | **数据来源**               | **更新频率** | **备注**               |
| ------- | ---------------------- | -------- | -------------------- |
| **马力**  | Lua (`powertrain` API) | 仅在加载/切车时 | 显示的是引擎最大潜力值，而非当前输出值。 |
| **扭矩**  | Lua (`powertrain` API) | 仅在加载/切车时 | 同上。                  |
| **重量**  | Streams (`wheelInfo`)  | 实时 (每帧)  | 基于物理受力计算，车辆腾空时数值会变。  |
| **推重比** | 前端计算                   | 实时       | 随重量变化而实时跳动。          |
