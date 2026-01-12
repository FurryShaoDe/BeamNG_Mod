以下是关于 BeamNG.drive 中绑定工作原理的概览。

### 术语

#### 控制器 (Controller)

连接到计算机的硬件设备。

也称为“设备”或“输入设备”。

例如：键盘、鼠标、操纵杆、方向盘、手柄、Android 远程应用。

#### 控制项 (Control)

控制器上的每个按键、按钮或轴。

例如：空格键、鼠标左键、摇杆水平轴、右踏板。

#### 事件 (Event)

输入事件是游戏引擎跟踪 [控制项](https://documentation.beamng.com/modding/input/introduction/#control) 每次移动（或状态改变）的方式。

#### 动作 (Action)

玩家操作 [控制项](https://documentation.beamng.com/modding/input/introduction/#control) 后可能发生的游戏内活动。

例如：向左转向、切换视角、切换菜单。

有关详细信息，请参阅 [动作](https://documentation.beamng.com/modding/input/actions)。

#### 动作类别 (Action Category)

用户界面（例如“选项”>“控制”菜单）可以将动作分类。这使得用户更容易浏览它们。

例如：“车辆”、“慢动作”、“调试”等。

有关详细信息，请参阅 [动作类别](https://documentation.beamng.com/modding/input/actions/#action-parameters)。

#### 绑定 (Binding)

动作和控制项之间的关系。

*（有时也称为 `input mapping`（输入映射）或 `inputmap`）*

例如：向上箭头 <-> 加速，Esc 键 <-> 切换菜单，左踏板 <-> 接合离合器。

每个控制项可以绑定到零个、一个或多个动作。

绑定是否处于活动状态取决于上下文。

例如：如果菜单关闭，菜单绑定将不会处于活动状态。

有关详细信息，请参阅 [绑定](https://documentation.beamng.com/modding/input/bindings)。

#### 动作映射 (Action Map)

一组 [绑定](https://documentation.beamng.com/modding/input/bindings)，可以成组地激活/停用，并且可以随时更改其优先级。

有关详细信息，请参阅 [动作映射](https://documentation.beamng.com/modding/input/action-maps)。

#### 输入映射 (InputMap)

包含控制器绑定的文件。

例如：settings/inputmaps/keyboard.json, settings/inputmaps/mouse.diff

默认输入映射使用 json 扩展名。用户配置使用 diff 扩展名（它们指定哪些绑定发生了更改以及如何更改：移除、添加、修改等）。

### 基本工作流程

绑定的工作方式如下：

1. 首先，用户操作其 [控制器](https://documentation.beamng.com/modding/input/introduction/#controller) 中的 [控制项](https://documentation.beamng.com/modding/input/introduction/#control)。
2. 这会生成一个输入 [事件](https://documentation.beamng.com/modding/input/introduction/#event)。
3. 游戏开始遍历活动的 [动作映射](https://documentation.beamng.com/modding/input/introduction/#action-map)，寻找一个或多个绑定。
4. 与这些绑定关联的动作将被执行。

最后修改时间：2022 年 6 月 9 日

---
gemini-3-pro翻译