### 1. 应用架构与数据流
*   **框架**：**AngularJS** 指令 + **HTML5 Canvas**（双画布架构）。
*   **数据获取机制**：
    *   **静态曲线数据**：通过自定义事件 **`TorqueCurveChanged`** 接收来自游戏 Lua 控制器的完整发动机扭矩/功率曲线数据包。这是主数据来源。
    *   **实时运行数据**：通过 **`StreamsManager`** 订阅 `engineInfo` 数据流，获取实时转速等参数。
*   **多引擎支持**：应用维护一个 `currentVehicle.engines` 列表。当 `TorqueCurveChanged` 事件携带新引擎数据时，将其加入列表，并通过下拉选择器 (`md-select`) 供用户切换。

### 2. 核心数据处理与存储
*   **曲线数据包结构**：`TorqueCurveChanged` 事件的数据 (`data`) 包含：
    *   `vehicleID`：车辆标识。
    *   `deviceName`：引擎名称。
    *   `maxRPM`：引擎最大转速。
    *   `curves`：核心曲线数据对象，其每个属性（如 `natural`， `forcedInduction`）代表一组曲线，包含：
        *   `name`：曲线组名称。
        *   `torque`：扭矩值数组。
        *   `power`：功率值数组。
        *   `dash`/`width`：绘制样式参数。
*   **数据转换与存储**：
    1.  原始数据通过 `UiUnits.torque()` 和 `UiUnits.power()` 进行单位换算。
    2.  转换后的数据存储在 `scope.config` 对象中，以曲线组名为键，结构化为 `torque` 和 `power` 两个对象，分别包含 `data` (数组)、`max`、`val` (当前值)、`units`、`color` 等属性，供绘图和表格使用。

### 3. 可视化绘制逻辑（双画布）
*   **画布分工**：
    *   **静态画布 (`staticCanvas`)**：由 `plotStaticGraphs()` 函数绘制所有不频繁变化的内容：坐标轴、网格、所有已启用的扭矩/功率曲线。
    *   **动态画布 (`dynamicCanvas`)**：在每次 `streamsUpdate` 时清除并重绘频繁变化的内容：代表当前转速的垂直指示线 (`rpmX`)。
*   **绘图辅助**：大量使用 **`CanvasShortcuts`** 服务（注入）来绘制坐标轴 (`plotAxis`) 和曲线 (`plotData`)，简化了底层 Canvas API 调用。
*   **坐标映射**：核心变量 `xFactor` 将 RPM 映射为画布上的 X 坐标。`plotData` 和 `plotAxis` 函数内部处理 Y 方向的数值到像素的映射。

### 4. 关键交互与生命周期
*   **引擎切换**：用户通过下拉菜单选择引擎，触发 `onEngineSelection()` -> `selectEngine()`，重新载入对应引擎的曲线数据并重绘静态图形。
*   **曲线显示控制**：通过 `scope.config` 中每个曲线组对象的 `isPresent` 属性（绑定到 `md-checkbox`）控制该组曲线是否在图中绘制及在底部表格中显示。
*   **初始化与更新**：
    1.  应用通过监听 `app:resized` 事件进行初始化，首次触发时调用 Lua 脚本 (`bngApi.activeObjectLua`) 请求曲线数据。
    2.  车辆切换 (`VehicleChange`, `VehicleFocusChanged`) 或游戏设置变更 (`SettingsChanged`) 时，也会重新请求数据。
*   **实时值更新**：在 `streamsUpdate` 中，根据当前转速 (`_rpm`) 作为索引，从 `scope.config[x].power/torque.data` 数组中取出对应的扭矩/功率值，更新到 `scope.config[x].power/torque.val`，驱动底部表格的实时数据更新。

### 5. 扩展与定制点
*   **数据源**：可修改以订阅更多 `streams`（如 `electrics` 用于电动车电机扭矩）。
*   **图形样式**：可修改 `plotMargins`、`gridParams`、`scope.config` 中的 `color`、`width`、`dashArray` 等。
*   **UI 布局**：可修改 Angular 模板，调整下拉菜单、画布区域、数据表格的布局和样式。
*   **功能扩展**：可在模板和数据模型中增加新的可视化元素（如最大扭矩点标记、差速器锁止状态指示等）。