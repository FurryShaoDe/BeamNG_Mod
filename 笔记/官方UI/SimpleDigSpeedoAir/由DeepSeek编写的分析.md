### 1. 应用定义与注册
*   **框架**: AngularJS (BeamNG 主框架) + Vue.js (UI 组件)。
*   **注册方式**: 通过 AngularJS 的 `.directive()` 方法注册指令 `simpleDigSpeedoAir`。
*   **挂载点**: Angular 指令的模板 `<div><simpledigitalspeedoair></simpledigitalspeedoair></div>` 被 Vue 应用实例 (`vueApp`) 接管和渲染。

### 2. 数据流与核心机制
*   **数据源**: 通过 `streams: ['electrics']` 声明订阅游戏内部的“电气系统”数据流。
*   **数据获取**: 在 Vue 组件的计算属性 `speed()` 中，使用 `this.getStore('streams', 'electrics', 'airspeed')` 获取当前的**空速原始值（米/秒）**。
*   **数据处理**:
    1.  **单位转换**: 使用全局工具 `UiUnits.speed(speedMs)` 将米/秒转换为玩家设定的单位（km/h 或 MPH），返回一个包含 `val` (数值) 和 `unit` (单位字符串) 的对象。
    2.  **格式化显示**: 对 `val` 进行固定小数位、切片等操作，并计算前导零 (`leadingZeros`)，实现类似数字仪表的“0000”格式显示。

### 3. 关键函数/方法
*   `createVueApp()`: (推断) 创建预设了 BeamNG 混合 (`BeamNGBaseAppMixin`) 和全局存储 (`GStore`) 的 Vue 3 应用实例。
*   `BeamNGBaseAppMixin`: 核心混合，提供了 `getStore` 等方法用于访问游戏状态数据。
*   `this.getStore(namespace, ...keys)`: **关键方法**，用于从游戏的状态存储中安全地获取数据。
*   `UiUnits.speed(value)`: **关键函数**，处理游戏内单位的转换与本地化。
*   `GStore`: 通过 Vue 的 `inject` 注入，推测为全局响应式状态管理。

### 4. 可用数据与扩展点
*   **核心数据**: `electrics` 流中的 `airspeed` (空速)。
*   **潜在扩展数据**: `electrics` 流可能包含的其他车辆电气数据（如电池电压、指示灯状态等）。可通过修改 `streams` 数组并调用 `getStore` 获取。
*   **UI 扩展**: 可直接修改 Vue 组件的 `template` 和 `computed` 属性，以改变显示样式或增加其他计算信息（如最大空速、单位切换按钮的逻辑）。
*   **框架机制**: 遵循“Angular 指令外壳 + Vue 内部组件”的模式，新 Mod 可复用此结构。

### 5. 生命周期
1.  Angular 编译链接阶段，执行 `link` 函数。
2.  创建并挂载 Vue 应用实例到 Angular 指令的元素上。
3.  Vue 组件通过 `getStore` 响应式地订阅游戏数据流。
4.  当 Angular 作用域销毁时 (`$destroy`)，卸载 Vue 应用以释放资源。