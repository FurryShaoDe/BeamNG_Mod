追问：它是如何实现图标滚动的？
## 一、关键机制（核心原理概括）

**图表“滚动”并不是移动整张曲线，而是通过在独立的动态 Canvas 上实时绘制一条随 RPM 变化的垂直指示线，实现“视角随数据移动”的效果。**

静态曲线绘制一次，动态滚动效果由 `streamsUpdate` 驱动的 RPM 游标刷新完成。

---

## 二、触发条件（什么时候会执行滚动）

### 1️⃣ 核心触发事件

```js
scope.$on('streamsUpdate', function (event, streams) { ... })
```

这是 **BeamNG UI 的实时数据流事件**，每一帧或固定时间间隔触发一次。

---

### 2️⃣ 触发前置条件

```js
if (streams.engineInfo) {
  var _rpm = streams.engineInfo[4]
}
if (_rpm >= maxRpm) { return; }
```

满足以下条件才会执行“滚动绘制”：

- `engineInfo` 数据存在
    
- RPM 小于当前引擎 `maxRpm`

---

## 三、数据流向（RPM 如何驱动滚动）

### 🔁 数据流完整路径

```text
Lua 引擎控制器
 ↓
StreamsManager（engineInfo 流）
 ↓
streamsUpdate 事件
 ↓
当前 RPM (_rpm)
 ↓
换算为 Canvas X 坐标
 ↓
动态 Canvas 上绘制竖线
```

---

### 1️⃣ 输入数据来源

```js
streams.engineInfo[4]  // 当前发动机 RPM
```

> 来自 BeamNG Lua 侧：  
> `controller.mainController.sendTorqueData()`

---

### 2️⃣ 坐标映射逻辑（关键）

```js
xFactor = (canvasWidth - leftMargin - rightMargin) / maxRpm
rpmX = plotMargins.left + Math.floor(_rpm * xFactor)
```

RPM → 像素位置的线性映射公式。

---

### 3️⃣ 输出位置

```js
dctx.moveTo(rpmX, plotMargins.top)
dctx.lineTo(rpmX, canvasHeight - plotMargins.bottom)
```

绘制在 **动态 Canvas（dynamicCanvas）** 上。

---

## 四、依赖关系（实现滚动所需的外部依赖）

### 🔗 关键依赖模块 / 服务

|依赖|作用|
|---|---|
|`StreamsManager`|注册 `engineInfo` 实时数据流|
|`engineInfo`|提供 RPM 实时数值|
|`CanvasShortcuts`|负责静态曲线与坐标轴绘制|
|双 Canvas 结构|静态/动态图层分离|
|`bngApi.activeObjectLua`|请求 Lua 侧推送数据|

---

### 🧱 Canvas 架构（非常关键）

```text
Canvas #1（staticCanvas）
 └─ 曲线、坐标轴（不滚动）

Canvas #2（dynamicCanvas）
 └─ RPM 垂直指示线（实时刷新）
```

👉 这就是**性能友好型滚动设计**，避免重绘整个图表。

---

## 五、一句话总结（Mod 开发精髓）

> **这个文件通过“双 Canvas 分层 + RPM → X 映射 + streamsUpdate 实时刷新”，用极低成本实现了高性能的图表滚动指示效果，而不是传统意义上的整图平移。**