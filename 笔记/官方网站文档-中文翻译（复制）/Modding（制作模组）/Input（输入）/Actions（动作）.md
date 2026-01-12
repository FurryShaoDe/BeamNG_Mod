### 概述

**动作 (Action)** 是指在玩家操作 [控制项 (Control)](https://documentation.beamng.com/modding/input/introduction/#control) 后可能发生的每一项游戏内活动。

例如：向左转向、切换视角、切换菜单。

动作定义在一个或多个 `.json` 文件中。

通过模组（Mods）提供新的额外动作是可能的。但请记住，如果你不提供相应的绑定（Bindings），那么你的模组用户将需要手动配置他们的控制器。

动作主要分为两类：[常规动作 (Regular actions)](https://documentation.beamng.com/modding/input/actions/#regular-actions) 和 [车辆特定动作 (Vehicle-specific actions)](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions)。

### 常规动作 (Regular Actions)

常规动作是指无论当前使用哪种车辆都可以发生的动作。

因此，即使在主菜单中，在进入任何关卡或生成任何车辆之前，它们也可以使用。

BeamNG.drive 自带许多预定义的**常规动作**。这些定义在：

```
lua/ge/extensions/core/input/actions/*.json
```

模组可以捆绑额外的常规动作。为此，它们必须按照此命名约定提供一个或多个额外的 json 文件：

```
lua/ge/extensions/core/input/actions/*.json
```

例如：

```
lua/ge/extensions/core/input/actions/explosions_mod.json
lua/ge/extensions/core/input/actions/advanced_menus.json
```

此处定义的任何动作都将在 `Options`（选项） → `Controls`（控制）菜单中对最终用户可用，并与 BeamNG.drive 提供的默认动作混合在一起。

虽然可以用自定义文件覆盖默认的 `input_actions.json` 文件，但这通过意味着模组作者需要在每次 BeamNG.drive 更新推出新动作（或修改、删除动作）时，不断更新其修改后的文件。因此，**强烈建议不要这样做**。

### 车辆特定动作 (Vehicle-specific Actions)

车辆特定动作是指只能在驾驶**特定**车辆时触发的动作。如果你切换到不同种类的车辆，它们将被新车辆的动作所取代。

BeamNG.drive 的一些官方车辆自带了一些预定义的车辆特定动作。例如，小型加农炮 (Small Cannon) 提供了使用控制器开火的功能。这些车辆特定动作定义在：

```
vehicles/vehicle_directory_name/input_actions.json
```

与 [常规动作](https://documentation.beamng.com/modding/input/actions/#regular-actions) 类似，模组也可以捆绑额外的车辆特定动作。模组提供的文件必须遵循此命名约定：

```
vehicles/vehicle_directory_name/input_actions*.json
```

例如：

```
vehicles/hatch/input_actions_hydraulic_suspension.json
vehicles/pickup/input_actions_winch_cable.json
```

所有这些动作通常都可以在 `Options`（选项） → `Controls`（控制）菜单的“Vehicle-specific”（车辆特定）类别中找到。

同样，为你的车辆特定动作文件使用唯一的文件名是必要的，以确保你的动作不会被使用相同文件名的其他模组覆盖。

### 动作文件格式

动作文件主要遵循 [json 格式](https://en.wikipedia.org/wiki/JSON)。它们必须以 `{` 开始并以 `}` 结束。以下是整体结构示例：

JavaScript

```
{

    "an_action"      : {"order":1,  "title":"做某事", ...},

    "another_action": {"order":2,  "title":"做其他事", ...},

    "third_action"  : {"order":10, "title":"做更多事", ...},

    //...

}
```

每一行有两个部分：

- 每行的第一个字符串是动作名称。例如 `"an_action"`。
- 该行的其余部分包含动作的参数。例如 `"order"`、`"title"`、`"ctx"` 等。

以下是关于它们的更多信息：

#### 动作名称

**动作名称必须是唯一的，否则它们可能会被使用相同动作名称的其他模组覆盖。具体来说：**

- [常规动作](https://documentation.beamng.com/modding/input/actions/#regular-actions) 名称必须与所有其他常规动作名称不同。
- [车辆特定](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions) 动作名称必须在当前车辆内是唯一的。

确保动作名称唯一的最简单方法是使用唯一的前缀。例如：`myMod_myAction`。

#### 动作参数

动作的参数控制动作实际执行的操作以及它在菜单中的显示方式。下表列出了所有详细信息：

（[车辆特定](https://documentation.beamng.com/modding/input/actions/#vehicle-specific-actions) 动作有一些特殊性，也在下面进行了描述）

| 参数名称 | 必填 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| **title** | 是 | string | n/a | 动作的标题，显示在 UI 中。 |
| **desc** | 是 | string | n/a | 完整描述，可能会显示为工具提示，长度应约为一句话。 |
| **isBasic** | 否 | boolean | true | 标记是否为基本动作。 |
| **cat**      (常规动作) | 是 | string | n/a | 参见 [动作类别](https://documentation.beamng.com/modding/input/actions/#action-categories)。 |
| **cat**      (车辆特定动作) | 否 | string | "vehicle\_specific" | 参见 [动作类别](https://documentation.beamng.com/modding/input/actions/#action-categories)。 |
| **order** | 是 | number | n/a | 排序顺序，决定在列表中的显示位置。 |
| **isCentered** | 否 | boolean | false | 如果为 `false`，动作将产生 0 到 1 范围内的值（例如，用于刹车踏板或手刹）。      如果为 `true`，生成的值将在 -1 到 +1 的范围内（例如，用于转向，或上下改变摄像机高度）。 |
| **actionMap**      (常规动作) | 否 | string | "Normal" | 决定该动作将被分配到哪个 [动作映射 (Action Map)](https://documentation.beamng.com/modding/input/introduction/#action-map) 中。按优先级顺序，最常见的动作映射是：      • **"Global"** - 即使 UI 获得焦点时也能工作（用于极少数动作，如 ALT+F4 绑定）。      • **"Menu"** - 当 `cat`（类别）为 "Menu" 时自动分配。      • **"Normal"** - 默认映射。如果有相同控制项触发了 Menu 动作，则此映射及以下的动作映射将不会被触发。      • **"VehicleCommon"** - 适用于多种车辆的动作。如果此动作上下文为 `vlua`，则自动分配。      • **"VehicleSpecific"** - 仅适用于当前活动车辆的动作。如果这是 `vehicle specific actions.json` 文件，则自动分配。         可以指定自定义名称，相应的动作映射将被自动创建。这对于希望快速停用/激活特定动作集的模组很有用。 |
| **actionMap**      (车辆特定动作) | 否 | string | "VehicleSpecific" | 决定该动作将被分配到哪个 [动作映射](https://documentation.beamng.com/modding/input/introduction/#action-map) 中。 |
| **ctx**      (常规动作) | 是 | string | n/a | 定义 `onChange`/`onUp`/`onDown`/`onRelative` 中代码的执行方式：      • **"ui"**：用于用户界面 - javascript (异步)      • **"vlua"**：用于当前车辆 - lua (异步)      • **"bvlua"**：用于所有车辆 - lua (异步)      • **"elua"**：用于游戏引擎 - lua (异步)      • **"tlua"**：用于游戏引擎 - lua (同步)      • **"ts"**：用于游戏引擎 - torquescript (同步) |
| **ctx**      (车辆特定动作) | 否 | string | "vlua" | 参见上面的描述。通常用于车辆 Lua。 |
| **onChange**      **onDown**      **onUp**      **onRelative** | 是      (至少一个) | string | n/a | 指定触发动作时将执行的源代码。代码执行上下文由当前动作的 `ctx` 参数定义。      必须至少定义其中一个。它们的触发方式如下：      • **onChange**: 当控制器位置改变时运行。支持：按键/按钮和轴。      • **onDown**: 当按下按键/按钮时运行。支持：按键/按钮。      • **onUp**: 当抬起按键/按钮时运行。支持：按键/按钮。      • **onRelative**: 当按住鼠标右键并移动鼠标时运行（除非你知道你在做什么，否则不要使用）。 |

### 动作类别 (Action Categories)

动作的类别是一个必填参数，仅具有装饰效果。

它将影响动作在各种游戏内菜单中的显示位置（例如 `Options` → `Controls` 中的动作层级结构）。

要查看可用类别的列表，请参考以下文件：

```
lua/ge/extensions/core/input/categories.lua
```

最后修改时间：2025 年 1 月 24 日

---
gemini-3-pro翻译