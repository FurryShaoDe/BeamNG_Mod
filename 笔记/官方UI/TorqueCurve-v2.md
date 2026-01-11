## 1. 架构概述

- **应用类型**: AngularJS Directive (`torqueCurve2`)。
    
- **依赖项**: `$log`, `CanvasShortcuts` (官方绘图辅助服务)。
    
- **DOM 结构**:
    
    - UI 容器：Flexbox 布局。
        
    - Canvas 层：双层 Canvas 叠加（`staticCanvas` 用于绘制背景和曲线，`dynamicCanvas` 用于绘制实时 RPM 指针）。
        
    - 数据面板：基于 `scope.config` 的动态表格，显示当前扭矩/功率数值。
        

## 2. 数据流与生命周期

### 初始化与触发

1. **加载**: `app:resized` 事件触发初始化。
    
2. **Lua 请求**: 调用 `bngApi.activeObjectLua('controller.mainController.sendTorqueData()')` 主动请求车辆数据。
    
3. **车辆变更**: 监听 `VehicleChange` 和 `VehicleFocusChanged` 以重置状态或重新请求数据。
    

### 静态数据 (曲线图)

- **来源**: 事件 `TorqueCurveChanged`。
    
- **处理逻辑**:
    
    1. 检测 `data.vehicleID`，若是新车则重置 `currentVehicle`。
        
    2. 解析 `data.curves`（包含原始扭矩/功率数组）。
        
    3. 通过 `updateScopeData()` 将原始数据转换为视图数据（应用 `UiUnits` 单位转换）。
        
    4. 存储至 `scope.config`，用于 DOM 绑定和绘图。
        

### 实时数据 (RPM 指针)

- **来源**: `streamsUpdate` 事件。
    
- **依赖流**: `engineInfo` (索引 `[4]` 为当前 RPM)。
    
- **处理逻辑**:
    
    1. 计算 X 轴坐标：`rpmX = plotMargins.left + (RPM * xFactor)`。
        
    2. 在 `dynamicCanvas` 上绘制垂直橙色线条。
        
    3. 更新 `scope.config` 中的实时数值（`val`）。
        

## 3. 核心渲染机制

### 静态图层 (`plotStaticGraphs`)

- **触发时机**: 引擎选择变更、配置变更或 `TorqueCurveChanged` 后。
    
- **工具**: 使用 `CanvasShortcuts` 服务（`plotAxis`, `plotData`）。
    
- **逻辑**:
    
    1. 计算 `xFactor` (像素/RPM 比例)。
        
    2. 计算 Y 轴最大值 (Max Torque/Power) 并规整化（按 250 为步长向上取整）。
        
    3. 绘制网格和坐标轴。
        
    4. 遍历 `scope.config` 绘制每一条可见的扭矩/功率曲线。
        

### 动态图层 (Inside `streamsUpdate`)

- **频率**: 每帧（取决于流更新频率）。
    
- **逻辑**: 清空画布 -> 绘制当前 RPM 线 -> 触发 Angular 脏检查更新数值文本。
    

## 4. 关键变量与状态

- `scope.config`: **核心显示模型**。包含所有曲线的颜色、单位、转换后的数据点 (`data`)、最大值 (`max`) 和当前值 (`val`)。
    
- `currentVehicle`: 缓存当前车辆 ID 和引擎列表，防止重复处理。
    
- `maxRpm`:以此为基准计算 X 轴缩放比例。
    

## 5. Mod 开发切入点 (Hooks)

### A. UI/视觉重构

- **覆盖 `template`**: 可以完全重写 HTML 结构（例如改用 SVG 替代 Canvas，或改变布局）。
    
- **替换 `CanvasShortcuts`**: 官方绘图服务较为简陋，可在 `plotStaticGraphs` 中改用 D3.js, Chart.js 或自定义 WebGL 逻辑。
    

### B. 数据逻辑扩展

- **拦截 `TorqueCurveChanged`**: 在调用 `updateScopeData` 之前修改 `data`。
    
    - _用途_: 添加自定义计算曲线（如轮上扭矩估算）、平滑数据或合并多引擎数据。
        
- **扩展 `scope.config`**:
    
    - _用途_: 在表格中显示额外参数（如涡轮压力、进气温度），需同时监听对应的 Streams。
        

### C. 交互增强

- **Hook `onEngineSelection`**:
    
    - _用途_: 实现多引擎对比功能（当前逻辑互斥，一次只选一个）。
        
- **Hook `streamsUpdate`**:
    
    - _用途_: 增加换挡提示光、峰值保持（Peak Hold）或历史轨迹回放。
        

---

下一步建议：

你需要我为你生成一个基础的 Mod 模板代码（保留核心 Lua 通信但替换渲染逻辑），还是针对特定功能（如由 Canvas 改为 SVG 渲染）提供实现代码？